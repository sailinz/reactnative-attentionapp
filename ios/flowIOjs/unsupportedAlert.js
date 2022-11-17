if(!navigator.bluetooth){
  //Insert an alert bar as the first child of the body
  let myAlertBar = document.createElement('div');
  myAlertBar.innerHTML = `
    <div style="text-align:center; padding-top:4px; padding-bottom:4px; background-color:#f44336; color:white;">
      <h3>Your browser is not supported. Please switch to a browser that supports web bluetooth, such as <u>Google Chrome</u> or <u>Microsoft Edge</u></h3>
    </div>
  `;
  document.body.prepend(myAlertBar);
}
