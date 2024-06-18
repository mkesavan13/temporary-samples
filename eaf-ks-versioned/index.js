const COOKIE_NAME = "webex_kitchen_sink_cookie";
const LOCAL_STORAGE_NAME = "webex_kitchen_sink_localstorage";
const SESSION_STORAGE_NAME = "webex_kitchen_sink_sessionstorage";
const LOG_LEVELS = {
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  SILENT: 3,
}

var embedded_app = new window.webex.Application();
var sidebar, meetings;
let deviceList;

const logLevelButton = document.getElementById("log-level")
const audioElement = document.getElementById('audio-output');
const selectedDevice = document.getElementById('selected-device');

const sidebarButtons = {
  getCalls: document.getElementById("get-calls"),
  showBadge: document.getElementById("show-badge"),
  clearBadge: document.getElementById("clear-badge"),
  badgeType: document.getElementById("badge-type"),
  badgeCount: document.getElementById("badge-count"),
};


const meetingsButtons = {
  presentationUrl: document.getElementById("presentation-url"),
  presentationTitle: document.getElementById("presentation-title"),
  shareMode: document.getElementById("share-mode"),
  includeAudio: document.getElementById("include-audio"),
  setPresentationUrl: document.getElementById("set-presentation-url"),
  clearPresentationUrl: document.getElementById("clear-presentation-url"),
};

const shareUrls = {
  internalShareUrl: document.getElementById('internalShareUrl'),
  externalShareUrl: document.getElementById('externalShareUrl'),
  presentationTitle: document.getElementById('presentationTitle')
}

const sysBrowserUrl = document.getElementById("sys-browser-url");
const sysBrowserOauthUrl = document.getElementById("sys-browser-oauth-url");
const currentTheme = document.getElementById("currentTheme");

sidebarButtons.badgeType.onchange = () => {
  if (sidebarButtons.badgeType.selectedOptions[0].value === "error") {
    sidebarButtons.badgeCount.setAttribute("disabled", true);
  } else {
    sidebarButtons.badgeCount.removeAttribute("disabled");
  }
};
logLevelButton.onchange = () => {
  embedded_app.log.updateLogLevel(Number(logLevelButton.selectedOptions[0].value));
}

function updateAppTheme(theme){
  currentTheme.innerHTML=theme;
  switch(theme){
    case 'LIGHT':
      currentTheme.classList.remove('dark');
      currentTheme.classList.add('light');
      break;
    case 'DARK':
      currentTheme.classList.add('dark');
      currentTheme.classList.remove('light');
      break;
  }
}

embedded_app.onReady().then(() => {
  log("onReady()", {message: "host app is ready"});
  updateAppTheme(embedded_app.theme);
  embedded_app.listen().then(() => {
    embedded_app.on("application:displayContextChanged", (payload) =>
      log("application:displayContextChanged", payload, "event")
    );
    embedded_app.on("application:shareStateChanged", (payload) =>
      log("application:shareStateChanged", payload, "event")
    );
    embedded_app.on("application:themeChanged", (payload) => {
      updateAppTheme(payload);
      log("application:themeChanged", payload, "event")
    });
    embedded_app.on("application:viewStateChanged", (payload) =>
      log("application:viewStateChanged", payload, "event")
    );
    embedded_app.on("meeting:infoChanged", (payload) =>
      log("meeting:infoChanged", payload, "event")
    );
    embedded_app.on("meeting:roleChanged", (payload) =>
      log("meeting:roleChanged", payload, "event")
    );
    embedded_app.on("space:infoChanged", (payload) =>
      log("space:infoChanged", payload, "event")
    );
    embedded_app.on("sidebar:callStateChanged", (payload) =>
      log("sidebar:callStateChanged", payload, "event")
    );

    embedded_app.on("application:selectedAudioDevicesChanged", (payload) => {
      log("application:selectedAudioDevicesChanged", payload, "event");
      updateAudioOuputDevice(payload.output.id);
    });
  });
});

function updateAudioOuputDevice(id) {
  audioElement.setSinkId(id);
  navigator.mediaDevices.enumerateDevices().then((devices) => {  
    devices.forEach((device) => {
      if (device.deviceId === id) {
        selectedDevice.innerHTML = `Playing this audio on ${device.label}`; 
      }
    });
  });
}

function handleLogApplication(){
  log("app.application.states", embedded_app.application.states);
}

function handleLogUser(){
  log("app.application.states.user", embedded_app.application.states.user);
}

function handleGetUser() {
  embedded_app.context
    .getUser()
    .then((u) => {
      log("getUser()", u);
    })
    .catch((error) => {
      log(
        "getUser() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleGetMeeting() {
  embedded_app.context
    .getMeeting()
    .then((m) => {
      meetings = m;
      for (let buttons in meetingsButtons) {
        meetingsButtons[buttons].removeAttribute("disabled");
      }
      log("getMeeting()", m);
    })
    .catch((error) => {
      log(
        "getMeeting() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleSetPresentationUrl() {
  if (!meetings) {
    log(
      "setPresentationUrl() promise failed as meeting info is not available",
      webex.Application.ErrorCodes[4]
    );
    return;
  }

  const presentation = {
    presentationUrl: meetingsButtons.presentationUrl.value,
    presentationTitle: meetingsButtons.presentationTitle.value,
    shareMode: parseInt(meetingsButtons.shareMode.selectedOptions[0].value),
    includeAudio: Boolean(meetingsButtons.includeAudio.selectedOptions[0].value),
  };

  meetings
    .setPresentationUrl(
      presentation.presentationUrl,
      presentation.presentationTitle,
      presentation.shareMode,
      presentation.includeAudio
    )
    .then((success) => {
      log("setPresentationUrl()", success);
    })
    .catch((error) => {
      log(
        "setPresentationUrl() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleClearPresentationUrl() {
  if (!meetings) {
    log(
      "clearPresentationUrl() promise failed as meeting info is not available",
      webex.Application.ErrorCodes[4]
    );
    return;
  }

  meetingsButtons.presentationUrl.value = "";
  meetingsButtons.presentationTitle.value = "";
  meetingsButtons.shareMode.selectedOptions[0].value = "";
  meetingsButtons.includeAudio.selectedOptions[0].value = "";

  meetings
    .clearPresentationUrl()
    .then((success) => {
      log("clearPresentationUrl()", success);
    })
    .catch((error) => {
      log(
        "clearPresentationUrl() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleGetSpace() {
  embedded_app.context
    .getSpace()
    .then((s) => {
      log("getSpace()", s);
    })
    .catch((error) => {
      log(
        "getSpace() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleOpenUrlInSystemBrowser() {
  const urlToOpen = sysBrowserUrl.value;
  embedded_app.openUrlInSystemBrowser(urlToOpen)
    .then((res) => {
      log("openUrlInSystemBrowser()", res);
    })
    .catch((error) => {
      log(
        "openUrlInSystemBrowser() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleInitiateSystemBrowserOAuth() {
  const urlToOpen = sysBrowserOauthUrl.value;
  embedded_app.initiateSystemBrowserOAuth(urlToOpen)
    .then((res) => {
      log("initiateSystemBrowserOAuth()", res);
    })
    .catch((error) => {
      log(
        "initiateSystemBrowserOAuth() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleGetSidebar() {
  embedded_app.context
    .getSidebar()
    .then((s) => {
      sidebar = s;
      for (let buttons in sidebarButtons) {
        sidebarButtons[buttons].removeAttribute("disabled");
      }
      log("getSidebar()", s.badge);
    })
    .catch((error) => {
      log(
        "getSidebar() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleGetCalls() {
  if (!sidebar) {
    log(
      "getCalls() promise failed as sidebar info is not available",
      webex.Application.ErrorCodes[4]
    );
    return;
  }

  sidebar
    .getCalls()
    .then((s) => {
      log("getCalls()", s);
    })
    .catch((error) => {
      log(
        "getCalls() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleShowBadge() {
  if (!sidebar) {
    log(
      "showBadge() promise failed as sidebar info is not available",
      webex.Application.ErrorCodes[4]
    );
    return;
  }

  const badge = {
    badgeType: sidebarButtons.badgeType.selectedOptions[0].value,
    count: parseInt(sidebarButtons.badgeCount.value),
  };

  if (badge.badgeType === "error") {
    delete badge.count;
  }

  sidebar
    .showBadge(badge)
    .then((success) => {
      log("showBadge()", success);
    })
    .catch((error) => {
      log(
        "showBadge() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleClearBadge() {
  if (!sidebar) {
    log(
      "clearBadge() promise failed as sidebar info is not available",
      webex.Application.ErrorCodes[4]
    );
    return;
  }

  sidebar
    .clearBadge()
    .then((success) => {
      sidebarButtons.badgeCount.value = 0;
      log("clearBadge()", success);
    })
    .catch((error) => {
      log(
        "clearBadge() promise failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleSetShare() {
  if (embedded_app.isShared) {
    log("ERROR: setShareUrl() should not be called while session is active");
    return;
  }
  const internalUrl = shareUrls.internalShareUrl.value;
  const externalUrl = shareUrls.externalShareUrl.value;
  const title = shareUrls.presentationTitle.value;
  embedded_app
    .setShareUrl(internalUrl, externalUrl, title)
    .then(() => {
      log("setShareUrl()", {
        message: "shared url to participants panel",
        data: {
          internalUrl,
          externalUrl,
          title
        }
      });
    })
    .catch((error) => {
      log(
        "setShareUrl() failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleClearShare() {
  embedded_app
    .clearShareUrl()
    .then(() => {
      log("clearShareUrl()", {message: "share url has been cleared"});
    })
    .catch((error) => {
      log(
        "clearShareUrl() failed with error",
        webex.Application.ErrorCodes[error]
      );
    });
}

function handleDisplayAppInfo() {
  log("Display Application", app);
}

var consoleElem = document.getElementById("console");

function log(origin, data, logType = "api") {
  var li = document.createElement("li");
  const logObject = {
    type: logType,
    origin,
    data,
    timestamp: new Date().toString(),
  };
  li.innerHTML = `
    <div class='per-log'>
      <div class='copy-button'><img title='Copy log' src='./images/copy-icon.png'><span class='copy-text'>Copy log</span></div>
      <b>
        ${logObject.type === "event" ? "EVENT data" : "API response"} - ${logObject.origin
    }
      </b>:
      <span>
        <pre style='word-break:break-all'>${JSON.stringify(
      logObject.data,
      null,
      4
    )}</pre>
      </span>
      <span style='color:black'>
        ${logObject.timestamp}
      </span>
    </div>
  `;
  if (logType && logType === "event") {
    li.classList.add("event-log");
  }
  let copyTextElement = li.getElementsByClassName("copy-text")[0];
  li.getElementsByClassName("copy-button")[0].addEventListener(
    "click",
    (event) => {
      navigator.clipboard.writeText(JSON.stringify(logObject, null, 4));
      copyTextElement.innerText = "Copied";
      setTimeout(() => {
        copyTextElement.innerText = "Copy log";
      }, 2000);
    }
  );
  consoleElem.prepend(li);
}

function clearLog() {
  consoleElem.innerHTML = "";
}

/** Cookies! **/

function getCookieInputValue() {
  let myValue = document.getElementById("cookieField").value;
  return myValue;
}

function handleSetCookie() {
  let myCookieValue = getCookieInputValue();
  setCookie(COOKIE_NAME, myCookieValue, 365);
  log("Cookie set!", myCookieValue);
} // End handleSetCookie()

function handleGetCookie() {
  let myCookie = getCookie(COOKIE_NAME);
  log("Cookie get! ", myCookie);
} // End handleGetCookie()

function handleClearCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  log("Cookie cleared!", document.cookie);
} // End handleClearCookie()

/** Source: https://www.w3schools.com/js/js_cookies.asp **/
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/** localStorage! **/

function handleSetLocalStorage() {
  let myValue = document.getElementById("localField").value;
  setLocalStorage(LOCAL_STORAGE_NAME, myValue);
  log("localStorage set!", myValue);
}
function handleGetLocalStorage() {
  let myValue = getLocalStorage(LOCAL_STORAGE_NAME);
  log("localStorage get!", myValue);
}

function handleClearLocalStorage() {
  deleteLocalStorageItem(LOCAL_STORAGE_NAME);
  log("localStorage cleared!", getLocalStorage(LOCAL_STORAGE_NAME));
}

function deleteLocalStorageItem(key) {
  window.localStorage.removeItem(key);
}

function getLocalStorage(keyName) {
  const myStorage = window.localStorage.getItem(keyName);
  return myStorage;
}

function setLocalStorage(key, value) {
  window.localStorage.setItem(key, value);
}

/** sessionStorage! **/

function handleSetSessionStorage() {
  let myValue = document.getElementById("sessionField").value;
  setSessionStorage(SESSION_STORAGE_NAME, myValue);
  log("sessionStorage set!", myValue);
}
function handleGetSessionStorage() {
  let myValue = getSessionStorage(SESSION_STORAGE_NAME);
  log("sessionStorage get!", myValue);
}

function handleClearSessionStorage() {
  deleteSessionStorageItem(SESSION_STORAGE_NAME);
  log("sessionStorage cleared!", getSessionStorage(SESSION_STORAGE_NAME));
}

function deleteSessionStorageItem(key) {
  window.sessionStorage.removeItem(key);
}
function getSessionStorage(keyName) {
  const myStorage = window.sessionStorage.getItem(keyName);
  return myStorage;
}

function setSessionStorage(key, value) {
  window.sessionStorage.setItem(key, value);
}

function expand(elem, query) {
  let element = document.querySelector(query);
  if (element) {
    if (element.classList.contains("closed")) {
      elem.innerHTML = `<strong>&or;</strong> Storage Choices`;
      element.classList.remove("closed");
      document.getElementById("app-left").scrollTop = "350";
    } else {
      elem.innerHTML = `> Storage Choices`;
      element.classList.add("closed");
      document.getElementById("app-left").scrollTop = "0";
    }
  }
}

parseJwtFromURLHash();
