var embedded_app = new window.webex.Application();

embedded_app.onReady().then(() => {
  log("onReady()", { message: "participant app is ready" });
  embedded_app.listen().then(() => {
    embedded_app.on("application:displayContextChanged", (payload) =>
      log("application:displayContextChanged", payload)
    );
    embedded_app.on("application:shareStateChanged", (payload) =>
      log("application:shareStateChanged", payload)
    );
    embedded_app.on("application:themeChanged", (payload) =>
      log("application:themeChanged", payload)
    );
    embedded_app.on("meeting:infoChanged", (payload) =>
      log("meeting:infoChanged", payload)
    );
    embedded_app.on("meeting:roleChanged", (payload) =>
      log("meeting:roleChanged", payload)
    );
    embedded_app.on("space:infoChanged", (payload) => log("space:infoChanged", payload));
  });
});

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
      log("getMeeting()", m);
    })
    .catch((error) => {
      log(
        "getMeeting() promise failed with error",
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

function handleDisplayAppInfo() {
  log("Display Application", app);
}

function log(type, data) {
  var ul = document.getElementById("console");
  var li = document.createElement("li");
  var payload = document.createTextNode(`${type}: ${JSON.stringify(data)}`);
  li.appendChild(payload);
  ul.prepend(li);
}
