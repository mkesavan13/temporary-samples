import React, {Component} from 'react';
import classNames from 'classnames';
import {Cookies, withCookies} from 'react-cookie';
import {instanceOf} from 'prop-types';
import {autobind} from 'core-decorators';

import {Button, Checkbox, Input, Topbar} from '@momentum-ui/react';

import SpaceWidget, {eventNames as spaceEvents} from '@webex/widget-space';
import RecentsWidget from '@webex/widget-recents';

import TokenInput from '@webex/private-react-component-token-input';
import SpaceDestination, {constants as destinationConstants} from '@webex/private-react-component-space-destination';
import ExampleCode from '@webex/private-react-component-example-code';

import {createSDKInstance, createSDKGuestInstance} from './sdk';
import ExternalControl from './external-control';

import './momentum.scss';
import styles from './styles.css';

const {
  MODE_ONE_ON_ONE,
  MODE_ONE_ON_ONE_ID,
  MODE_SPACE,
  MODE_SIP
} = destinationConstants;

const spaceWidgetElementId = 'my-webex-space-widget';
const recentsWidgetElementId = 'my-webex-recents-widget';

class DemoWidget extends Component {
  constructor(props) {
    super(props);
    const {cookies} = this.props;
    const mode = cookies.get('destinationMode') || MODE_SPACE;
    const destinationId = cookies.get('destinationId') || '';
    const isMeetOnly = [MODE_SIP].includes(mode);
    const activities = cookies.get('activities') || {
      files: true,
      meet: true,
      message: true,
      people: true
    };
    const composerActions = cookies.get('activities') || {
      attachFiles: true
    };

    this.state = {
      activities: {
        files: isMeetOnly ? false : activities.files,
        meet: activities.meet,
        message: isMeetOnly ? false : activities.message,
        people: activities.people
      },
      accessToken: cookies.get('accessToken') || '',
      accessTokenType: cookies.get('accessTokenType') || '',
      composerActions,
      destinationId,
      disableFlags: false,
      disablePresence: false,
      fedramp: cookies.get('fedramp') === 'true' || false,
      initialActivity:
        isMeetOnly
          ? 'meet'
          : cookies.get('initialActivity') || 'message',
      enableSpaceListFilter:
        cookies.get('enableSpaceListFilter') === undefined
          ? true
          : cookies.get('enableSpaceListFilter') === 'true',
      generateSDKInstance: false,
      mode,
      recentsBasicMode: cookies.get('recentsBasicMode') === 'true',
      recentsEnableAddButton: cookies.get('recentsEnableAddButton') === 'true',
      recentsEnableUserProfile:
        cookies.get('recentsEnableUserProfile') === undefined
          ? true
          : cookies.get('recentsEnableUserProfile') === 'true',
      recentsEnableUserProfileMenu: cookies.get('recentsEnableUserProfileMenu') === 'true',
      recentsRunning: false,
      recentsWidgetProps: {},
      secondaryActivitiesFullWidth: false,
      setCurrentActivity: '',
      spaceLoadCount: cookies.get('spaceLoadCount') || '25',
      spaceLoadCountInputErrors: [],
      spaceRunning: false,
      spaceWidgetProps: {},
      stickyMode: false
    };
  }

  shouldComponentUpdate() {
    return true;
  }

  @autobind
  handleOpenSpaceWidget(e) {
    e.preventDefault();
    const {cookies} = this.props;

    cookies.set('accessToken', this.state.accessToken);
    cookies.set('accessTokenType', this.state.accessTokenType);
    cookies.set('activities', this.state.activities);
    cookies.set('destinationId', this.state.destinationId);
    cookies.set('destinationMode', this.state.mode);
    cookies.set('fedramp', this.state.fedramp);
    cookies.set('initialActivity', this.state.initialActivity);

    const toPerson = this.state.mode === MODE_ONE_ON_ONE ? this.state.destinationId : '';
    const toPersonId = this.state.mode === MODE_ONE_ON_ONE_ID ? this.state.destinationId : '';
    const toSpace = this.state.mode === MODE_SPACE ? this.state.destinationId : '';

    this.openSpaceWidget({
      toPerson,
      toPersonId,
      toSpace,
      destinationId: this.state.destinationId,
      destinationType: this.state.mode
    });
  }

  @autobind
  async handleOpenRecentsWidget(e) {
    e.preventDefault();
    const {cookies} = this.props;

    cookies.set('accessToken', this.state.accessToken);
    cookies.set('accessTokenType', this.state.accessTokenType);
    cookies.set('fedramp', this.state.fedramp);
    cookies.set('enableSpaceListFilter', this.state.enableSpaceListFilter);
    cookies.set('recentsBasicMode', this.state.recentsBasicMode);
    cookies.set('recentsEnableAddButton', this.state.recentsEnableAddButton);
    cookies.set('recentsEnableUserProfile', this.state.recentsEnableUserProfile);
    cookies.set('recentsEnableUserProfileMenu', this.state.recentsEnableUserProfileMenu);
    cookies.set('spaceLoadCount', this.state.spaceLoadCount);

    const widgetOptions = {
      basicMode: this.state.recentsBasicMode,
      enableSpaceListFilter: this.state.enableSpaceListFilter,
      enableAddButton: this.state.recentsEnableAddButton,
      enableUserProfile: this.state.recentsEnableUserProfile,
      enableUserProfileMenu: this.state.recentsEnableUserProfileMenu,
      fedramp: this.state.fedramp,
      spaceLoadCount: Number(this.state.spaceLoadCount),
      onEvent: (eventName, detail) => {
        window.ciscoSparkEvents.push({eventName, detail});
        if (eventName === 'rooms:selected') {
          const spaceId = detail.id;

          if (this.state.spaceRunning) {
            this.handleRemove();
          }
          this.openSpaceWidget({
            destinationType: 'spaceId',
            destinationId: spaceId,
            toSpace: spaceId
          });
        }
      }
    };

    if (this.state.accessTokenType === 'JWT') {
      if (this.state.generateSDKInstance) {
        widgetOptions.sdkInstance = await createSDKGuestInstance(this.state.accessToken);
      }
      else {
        widgetOptions.guestToken = this.state.accessToken;
      }
    }
    else if (this.state.generateSDKInstance) {
      widgetOptions.sdkInstance = await createSDKInstance(
        this.state.accessToken,
        {
          fedramp: this.state.fedramp
        }
      );
    }
    else {
      widgetOptions.accessToken = this.state.accessToken;
    }

    this.setState({recentsRunning: true, recentsWidgetProps: widgetOptions});
  }

  @autobind
  handleRemove() {
    this.setState({spaceRunning: false});
  }

  @autobind
  handleRecentsRemove() {
    this.setState({recentsRunning: false});
  }

  @autobind
  handleAccessTokenChange(
    accessToken,
    accessTokenType,
    generateSDKInstance,
    fedramp = false
  ) {
    return this.setState({
      accessToken,
      accessTokenType,
      generateSDKInstance,
      fedramp
    });
  }

  @autobind
  handleModeChange(value) {
    const newState = {destinationId: ''};

    newState.activities = this.state.activities;
    if ([MODE_SIP].includes(value)) {
      newState.initialActivity = 'meet';
      newState.activities.files = false;
      newState.activities.message = false;
    }
    newState.mode = value;

    return this.setState(newState);
  }

  @autobind
  handleActivitiesChange(event) {
    const {value, checked} = event.target;
    const {activities} = this.state;

    activities[value] = checked;

    return this.setState({activities});
  }

  @autobind
  handleComposerActionsChange(event) {
    const {value, checked} = event.target;
    const {composerActions} = this.state;

    composerActions[value] = checked;

    return this.setState({composerActions});
  }

  @autobind
  handleDestinationChange(e) {
    return this.setState({destinationId: e.target.value});
  }

  @autobind
  handleInitialActivityChange(value) {
    return this.setState({initialActivity: value});
  }

  @autobind
  handleChangeActivity(value) {
    return this.setState({setCurrentActivity: value});
  }

  @autobind
  handleToggleStickyMode() {
    this.setState((state) => (
      {stickyMode: !state.stickyMode}
    ));
  }

  @autobind
  handleRecentSpaceLoadCountChange(e) {
    const isEmpty = e.target.value === '';
    const isValid = e.target.value >= 25;
    const errors = isEmpty ? [{error: 'Value can not be empty', type: 'error'}] : [];

    if (!isValid) {
      errors.push({error: 'Value must be greater than or equal to 25.', type: 'error'});
    }

    this.setState({
      spaceLoadCountInputErrors: errors,
      spaceLoadCount: e.target.value ? e.target.value : ''
    });
  }

  @autobind
  handleRecentSpaceFilterToggle() {
    this.setState((state) => (
      {enableSpaceListFilter: !state.enableSpaceListFilter}
    ));
  }

  @autobind
  handleRecentBasicModeToggle() {
    this.setState((state) => (
      {recentsBasicMode: !state.recentsBasicMode}
    ));
  }

  @autobind
  handleRecentsEnableAddButton() {
    this.setState((state) => (
      {recentsEnableAddButton: !state.recentsEnableAddButton}
    ));
  }

  @autobind
  handleRecentsEnableUserProfile() {
    this.setState((state) => (
      {recentsEnableUserProfile: !state.recentsEnableUserProfile}
    ));
  }

  @autobind
  handleRecentsEnableUserProfileMenu() {
    this.setState((state) => (
      {recentsEnableUserProfileMenu: !state.recentsEnableUserProfileMenu}
    ));
  }


  @autobind
  handleSecondaryFullWidthChange(event) {
    const {checked} = event.target;

    return this.setState({secondaryActivitiesFullWidth: checked});
  }

  @autobind
  handleDisablePresenceChange(event) {
    const {checked} = event.target;

    return this.setState({disablePresence: checked});
  }

  @autobind
  handleDisableFlagsChange(event) {
    const {checked} = event.target;

    return this.setState({disableFlags: checked});
  }

  @autobind
  async openSpaceWidget({destinationId, destinationType}) {
    const widgetOptions = {
      composerActions: this.state.composerActions,
      disableFlags: this.state.disableFlags,
      disablePresence: this.state.disablePresence,
      fedramp: this.state.fedramp,
      initialActivity: this.state.initialActivity,
      secondaryActivitiesFullWidth: this.state.secondaryActivitiesFullWidth,
      spaceActivities: this.state.activities,
      onEvent: (eventName, detail) => {
        window.ciscoSparkEvents.push({eventName, detail});
        if (eventName === spaceEvents.ACTIVITY_CHANGED) {
          this.setState({setCurrentActivity: ''});
        }
      }
    };

    if (this.state.accessTokenType === 'JWT') {
      if (this.state.generateSDKInstance) {
        widgetOptions.sdkInstance = await createSDKGuestInstance(this.state.accessToken);
      }
      else {
        widgetOptions.guestToken = this.state.accessToken;
      }
    }
    else if (this.state.generateSDKInstance) {
      widgetOptions.sdkInstance = await createSDKInstance(
        this.state.accessToken,
        {
          fedramp: this.state.fedramp
        }
      );
    }
    else {
      widgetOptions.accessToken = this.state.accessToken;
    }

    widgetOptions.destinationId = destinationId;
    widgetOptions.destinationType = destinationType;

    // External Control Props
    widgetOptions.setCurrentActivity = this.state.setCurrentActivity;

    this.setState({spaceRunning: true, spaceWidgetProps: widgetOptions});
  }

  generateExampleCode() {
    const {
      accessTokenType, activities, destinationId, mode
    } = this.state;

    const tokenString = accessTokenType === 'JWT' ? "guestToken: 'XXXXXXXXXXXXXX'" : "accessToken: 'XXXXXXXXXXXXXX'";
    const spaceLoadCount = `spaceLoadCount: ${this.state.spaceLoadCount}`;
    const enableSpaceListFilter = `enableSpaceListFilter: ${this.state.enableSpaceListFilter}`;
    const enableAddButton = `enableAddButton: ${this.state.recentsEnableAddButton}`;
    const enableUserProfile = `enableUserProfile: ${this.state.recentsEnableUserProfile}`;
    const enableUserProfileMenu = `enableUserProfileMenu: ${this.state.recentsEnableUserProfileMenu}`;

    // Recents widget example code
    const recentsCode = `<div id="my-webex-widget" />
<script>
  var widgetEl = document.getElementById('my-webex-widget');
  // Init a new widget
  webex.widget(widgetEl).recentsWidget({
    ${tokenString}
    ${spaceLoadCount}
    ${enableUserProfile}
    ${enableUserProfileMenu}
    ${enableSpaceListFilter}
    ${enableAddButton}
  });
</script>`;

    // Space widget example code
    const activityTypesField = `spaceActivities: ${JSON.stringify(activities)}`;
    const destinationPlaceholder = `YOUR_DESTINATION_${this.state.mode.toUpperCase()}`;
    const destinationIdField = `destinationId: '${destinationId || destinationPlaceholder}'`;
    const destinationTypeField = `destinationType: '${mode}'`;
    const initialActivityField = `initialActivity: '${this.state.initialActivity}'`;
    const secondaryActivitiesFullWidth = `secondaryActivitiesFullWidth: ${this.state.secondaryActivitiesFullWidth}`;
    const composerActionsDisplay = `composerActions: ${JSON.stringify(this.state.composerActions)}`;
    const disablePresence = `disablePresence: ${JSON.stringify(this.state.disablePresence)}`;
    const disableFlags = `disableFlags: ${JSON.stringify(this.state.disableFlags)}`;

    const spaceCode = `<div id="my-webex-widget" />
<script>
  var widgetEl = document.getElementById('my-webex-widget');
  // Init a new widget
  webex.widget(widgetEl).spaceWidget({
    ${tokenString},
    ${destinationIdField},
    ${destinationTypeField},
    ${activityTypesField},
    ${initialActivityField},
    ${secondaryActivitiesFullWidth},
    ${composerActionsDisplay},
    ${disablePresence},
    ${disableFlags}
  });
</script>`;

    return {recentsCode, spaceCode};
  }

  render() {
    const {recentsCode, spaceCode} = this.generateExampleCode();
    const loadButtonEnabled = this.state.accessToken && this.state.destinationId;
    const loadRecentsButtonEnabled = this.state.accessToken
      || !this.state.spaceLoadCountInputErrors.length && !this.state.recentsRunning;
    const componentSpaceContainerClassNames = [
      styles.widgetSpaceComponentContainer
    ];

    if (!this.state.spaceRunning) {
      componentSpaceContainerClassNames.push(styles.hidden);
    }
    const componentRecentsContainerClassNames = [
      styles.widgetRecentsComponentContainer
    ];

    if (!this.state.recentsRunning) {
      componentRecentsContainerClassNames.push(styles.hidden);
    }
    const runningDemosContainerClassNames = [
      this.state.stickyMode ? styles.runningDemosSticky : styles.runningDemosBottom
    ];

    if (!this.state.spaceRunning && !this.state.recentsRunning) {
      runningDemosContainerClassNames.push(styles.hidden);
    }

    // eslint-disable-reason should not apply to jsx/html markup
    /* eslint-disable max-len */
    return (
      <div>
        <Topbar title="Webex Widgets Demo" />
        <div>
          <div className={styles.section}>
            <div>
              <h1>Webex Widgets Demo</h1>
              <p>The Webex widgets allow developers to easily incorporate Webex Widgets into an application.</p>
              <p>Our widgets are built using <a href="https://github.com/facebook/react">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, and the <a href="https://github.com/webex/webex-js-sdk">Webex Javascript SDK </a>.</p>
            </div>
          </div>
          <TokenInput
            onLogin={this.handleAccessTokenChange}
            token={this.state.accessToken}
            tokenType={this.state.accessTokenType}
            fedramp={this.state.fedramp}
          />
          <div className={styles.section}>
            <div>
              <h2>Space Widget</h2>
              <p>The Webex Space widget allows developers to easily incorporate Webex Space messaging and meeting into an application.</p>
              <div>
                { !this.state.spaceRunning &&
                  <SpaceDestination
                    activities={this.state.activities}
                    composerActions={this.state.composerActions}
                    destinationId={this.state.destinationId}
                    initialActivity={this.state.initialActivity}
                    mode={this.state.mode}
                    onActivitiesChange={this.handleActivitiesChange}
                    onComposerActionsChange={this.handleComposerActionsChange}
                    onDestinationChange={this.handleDestinationChange}
                    onDestinationPropTypeChange={this.handleDestinationPropTypeChange}
                    onInitialActivityChange={this.handleInitialActivityChange}
                    onModeChange={this.handleModeChange}
                    onSecondaryFullWidthChange={this.handleSecondaryFullWidthChange}
                    secondaryFullWidth={this.state.secondaryActivitiesFullWidth}
                    onDisablePresenceChange={this.handleDisablePresenceChange}
                    disablePresence={this.state.disablePresence}
                    onDisableFlagsChange={this.handleDisableFlagsChange}
                    disableFlags={this.state.disableFlags}
                  />
                }
                { this.state.spaceRunning &&
                  <ExternalControl
                    activity={this.state.setCurrentActivity}
                    onChangeActivity={this.handleChangeActivity}
                  />
                }
              </div>
              <div>
                <Button
                  ariaLabel={this.state.spaceRunning ? 'Update Space Widget' : 'Open Space Widget'}
                  color="blue"
                  disabled={!loadButtonEnabled}
                  id="openWidgetButton"
                  onClick={this.handleOpenSpaceWidget}
                >
                  {
                    this.state.spaceRunning ? 'Update Space Widget' : 'Open Space Widget'
                  }
                </Button>
                <Button
                  ariaLabel="Remove Widget"
                  color="blue"
                  disabled={!this.state.spaceRunning}
                  id="removeWidgetButton"
                  onClick={this.handleRemove}
                >
                  Remove Widget
                </Button>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <h2>Space Widget Example Code</h2>
            <div className={classNames(styles.example)}>
              <ExampleCode code={spaceCode} />
            </div>
          </div>
          <div className={styles.section}>
            <div>
              <h2>Recents Widget</h2>
              <p>
                The Webex Recents widget allows developers to easily incorporate Webex Recents list and events into an application.
              </p>
              <div>
                <h3>Space Load Count</h3>
                <Input
                  htmlId="recentsSpaceLoadCount"
                  label="Amount of spaces to load"
                  inputSize="small-12"
                  type="number"
                  onChange={this.handleRecentSpaceLoadCountChange}
                  value={this.state.spaceLoadCount}
                  disabled={this.state.recentsRunning}
                  errorArr={this.state.spaceLoadCountInputErrors}
                />
              </div>
              <h3>Header Options</h3>
              <Checkbox
                checked={this.state.recentsEnableUserProfile}
                htmlId="recentsUserProfile"
                label="Enable User Profile"
                onChange={this.handleRecentsEnableUserProfile}
                value="Enable User Profile"
                disabled={this.state.recentsRunning}
              />
              <Checkbox
                checked={this.state.recentsEnableUserProfileMenu}
                htmlId="recentsUserProfileMenu"
                label="Enable User Profile Setting Menu"
                onChange={this.handleRecentsEnableUserProfileMenu}
                value="Enable User Profile Popover"
                disabled={this.state.recentsRunning}
              />
              <Checkbox
                checked={this.state.enableSpaceListFilter}
                htmlId="recentsSpaceListFilter"
                label="Enable Space List Filter"
                onChange={this.handleRecentSpaceFilterToggle}
                value="Enable Space List Filter"
                disabled={this.state.recentsRunning}
              />
              <Checkbox
                checked={this.state.recentsEnableAddButton}
                htmlId="recentsAddSpaceButton"
                label="Enable Add Space Button"
                onChange={this.handleRecentsEnableAddButton}
                value="Enable Add Space Button"
                disabled={this.state.recentsRunning}
              />
              <h3>Advanced Options</h3>
              <Checkbox
                checked={this.state.recentsBasicMode}
                htmlId="recentsBasicMode"
                label="Enable Basic Mode"
                onChange={this.handleRecentBasicModeToggle}
                value="Enable Basic Mode"
                disabled={this.state.recentsRunning}
              />
              <Button
                ariaLabel="Open Recents Widget"
                color="blue"
                disabled={!loadRecentsButtonEnabled}
                onClick={this.handleOpenRecentsWidget}
              >
                Open Recents Widget
              </Button>
              <Button
                ariaLabel="Remove Recents Widget"
                color="blue"
                disabled={!this.state.recentsRunning}
                id="removeRecentsWidgetButton"
                onClick={this.handleRecentsRemove}
              >
                Remove Recents Widget
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <h2>Recents Widget Example Code</h2>
            <div className={classNames(styles.example)}>
              <ExampleCode code={recentsCode} />
            </div>
          </div>
          <div className={classNames(runningDemosContainerClassNames)}>
            <div className={classNames(componentSpaceContainerClassNames)}>
              <div id={spaceWidgetElementId}>
                { this.state.spaceRunning &&
                  <SpaceWidget {...this.state.spaceWidgetProps} />
                }
              </div>
            </div>
            <div className={styles.stickyButton}>
              <Button
                ariaLabel="Remove Recents Widget"
                color="blue"
                id="toggleStickyModeButton"
                onClick={this.handleToggleStickyMode}
              >
                {this.state.stickyMode ? 'Unstick Widgets' : 'Stick Widgets'}
              </Button>
            </div>
            <div className={classNames(componentRecentsContainerClassNames)}>
              <div id={recentsWidgetElementId}>
                {
                  this.state.recentsRunning &&
                  <RecentsWidget {...this.state.recentsWidgetProps} />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DemoWidget.propTypes = {
  cookies: instanceOf(Cookies).isRequired
};

DemoWidget.title = 'Widget Demo';
DemoWidget.path = '/widget-demo';

export default withCookies(DemoWidget);
