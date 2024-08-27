import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Radio, RadioGroup} from '@momentum-ui/react';

class ExternalControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activity: props.activity
      // sendMessage: '',
      // startCall: false
    };

    this.handleActivityChange = this.handleActivityChange.bind(this);
    // this.handleSendMessageChange = this.handleSendMessageChange.bind(this);
    // this.handleStartCallChange = this.handleStartCallChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({activity: nextProps.activity});
  }

  handleActivityChange(value) {
    this.setState({activity: value});
    this.props.onChangeActivity(value);
  }

  // handleSendMessageChange(e) {
  //   const {value} = e.target;
  //   this.setState({sendMessage: value});
  //   this.props.onChangeSendMessage(value);
  // }

  // handleStartCallChange(value) {
  //   this.setState({startCall: value});
  //   this.props.onChangeStartCall(value);
  // }

  render() {
    return (
      <div>
        <h3>Change Current Activity</h3>
        <RadioGroup
          ariaLabel="Change Activity"
          name="changeActivity"
          onChange={this.handleActivityChange}
          values={[this.state.activity]}
        >
          <Radio
            ariaLabel="Message"
            htmlId="changeActivityMessage"
            label="Message"
            value="message"
          />
          <Radio
            ariaLabel="Meet"
            htmlId="changeActivityMeet"
            label="Meet"
            value="meet"
          />
          <Radio
            ariaLabel="People"
            htmlId="changeActivityPeople"
            label="People"
            value="people"
          />
        </RadioGroup>
        {/* <h3>Start Call</h3>
        <RadioGroup
          ariaLabel="Start Call"
          name="changeActivity"
          onChange={this.handleStartCallChange}
          values={[this.state.startCall]}
        >
          <Radio
            ariaLabel="True"
            htmlId="changeStartCallTrue"
            label="True"
            value="true"
          />
          <Radio
            ariaLabel="False"
            htmlId="changeStartCallFalse"
            label="False"
            value=""
          />
        </RadioGroup>
        <div>
          <h3> Send Message </h3>
          <Input
            aria-label="Send Message"
            htmlId="sendMessage"
            inputSize="medium-12"
            onChange={this.handleSendMessageChange}
            placeholder="Send a message to the space"
            value={this.state.sendMessage}
          />
        </div> */}
      </div>
    );
  }
}

ExternalControl.propTypes = {
  activity: PropTypes.string,
  onChangeActivity: PropTypes.func.isRequired
  // onChangeSendMessage: PropTypes.func.isRequired,
  // onChangeStartCall: PropTypes.func.isRequired
};

ExternalControl.defaultProps = {
  activity: ''
};

export default ExternalControl;
