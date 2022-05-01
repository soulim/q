function onResponse(response) {
  console.log(response);
}

function onError(error) {
  console.error(error);
}

let sending = browser.runtime.sendNativeMessage("dev.sulim.q", "ping");
sending.then(onResponse, onError);
