//This function will create a new tab whenver it is executed, and a new device instance.
//Our primary tab is created manually in the HTML, and subseqnet tabs created dynamically.
//Manual creation of the first tab is better for readability and comprehension.

function newTab(){
  createNewInstance(); //adds new element to the 'flowios' array

  //(1) - create a div element
  //(2) - set its class to "tab"
  //(3) - set a unique ID which will be useful if we want to remove the tab.
  //(4) - set its innerHTML to the tab contents
  //(5) - get handles to the parent element and the last child of the parent.
  //(6) - insert the new tab before the last child.
  let myNewTab = document.createElement('div');
  myNewTab.className = "tab";
  let i = flowios.length-1; //index # of the newly created instance.
  myNewTab.id = `tab${i}`;
  myNewTab.innerHTML = tabInnerHTML(i);
  let myTabs = document.getElementById('tabs');
  let newTabButton = document.getElementById("new-tab-button");
  myTabs.insertBefore(myNewTab,newTabButton);

  //Show the contents of the new tab by by setting the checked property to true.
  document.getElementById(`flowio${i}`).checked = true;

  //Inject the flowio graphic
  injectSVG(`flowiographic${i}`,i);
}

function tabInnerHTML(i){ //i is the instance number
  return `
    <input type="radio" name="tabset" id="flowio${i}">
    <label for="flowio${i}">FlowI/O ${i}</label>
    <section class="tabcontent">
      <!--BEGIN: Main content-->
      <div class="grid-parent"><!--BEGIN: Parent grid-->
        <div class="grid-sidebar"><!--BEGIN: Sidebar grid-->
          <div class="center"><!--Begin Connect / Disconnect section-->
            <button class="button icon-disconnected" id="reconnect_btn${i}" visible onclick="reconnectDevice(flowios[${i}])" type="button" title="Device is disconnected. Press to reconnect." ></button>
            <button class="button icon-connected" id="disconnect_btn${i}" hidden onclick="disconnectDevice(flowios[${i}])" type="button" title="Device is connected. Press to disconnect."></button>
            <button class="button icon-loading" hidden id="loading_btn${i}" type="button" title="Waiting for connection..."></button>
          </div><!--End Connect / Disconnect section-->
          <!--BEGIN: Indicators Section-->
          <div class="center">
            <button id='ok_btn${i}' class='x${i} button icon-ok' onclick="flowios[${i}].readError()" type="button" disabled title="All looks good."></button>
            <button id='error_btn${i}'class='x${i} button icon-error' onclick="flowios[${i}].readError()" type="button" hidden disabled title="Error has occurred -> check log"></button>
          </div>
          <!--END: Indicators Section-->
          <!-- Battery percentage is shown in the tooltip -->
          <button class="x${i} button center icon-battery-100" disabled id="batt_refresh_btn${i}" onclick="flowios[${i}].getBatteryLevel()" type="button"></button>
          <!--Begin Power Section-->
          <div class="center">
            <button class="x${i} button icon-power" onclick="flowios[${i}].setTimer(0)" type="button" title="Power Off" disabled></button>
            <select class='x${i} poweroff' id="autoOff_select${i}" onchange="flowios[${i}].setTimer()" title="Auto off timer." disabled>
              <option value="255">Disabled</option>
              <option value="1">1 min</option>
              <option value="2">2 min</option>
              <option value="3">3 min</option>
              <option value="4">4 min</option>
              <option value="5">5 min</option>
              <option value="6">6 min</option>
              <option selected disabled></option>
            </select>
          </div>
          <div>
            <button id='minremaining${i}' class="x${i} btn-timer smallfont" onclick="flowios[${i}].getRemainingTime()" title="Auto off remaining minutes"></button>
          </div>
          <!--End Power Section-->
          <div></div>
          <div></div>
          <button class="button icon-remove" id="remove_btn${i}" onclick="removeTab(${i})" type="button" title="Remove device instance"></button>
        </div><!-- END: Sidebar grid-->
        <hr>
        <div class="grid-leftColumn"><!--Begin nested grid (left)-->
          <div style="grid-area: title;">
            <h3>Config / Control</h3>
            <hr>
          </div>
          <p style="grid-area: pwmvac">Vacuum PWM: <span id="pwm_o_label${i}"></span><br><input class='x${i}' oninput="setPump2PWM(flowios[${i}])" type="range" id="pwm_o${i}" min="100" max="255" value="255" disabled> </p>
          <p style="grid-area: pwminf">Inflation PWM:  <span id="pwm_i_label${i}"></span><br><input class='x${i}' oninput="setPump1PWM(flowios[${i}])" type="range" id="pwm_i${i}" min="100" max="255" value="255" disabled></p>
          <div class="bordered center marginRight" style="grid-area: ctrls; z-index: 1;">
              <div class="inmiddle">
                <button class="x${i} button icon-inflate" onmousedown="flowios[${i}].startInflation(getSelectedPorts(flowios[${i}]))" onmouseup="flowios[${i}].stopAction(getSelectedPorts(flowios[${i}]))" type="button" disabled title="Inflate"></button>
                <button class="x${i} button icon-vacuum" onmousedown="flowios[${i}].startVacuum(getSelectedPorts(flowios[${i}]))" onmouseup="flowios[${i}].stopAction(getSelectedPorts(flowios[${i}]))" type="button" disabled title="Vacuum"></button>
                <button class="x${i} button icon-release" onmousedown="flowios[${i}].startRelease(getSelectedPorts(flowios[${i}]))" onmouseup="flowios[${i}].stopAction(getSelectedPorts(flowios[${i}]))" type="button" disabled title="Release"></button>
                <button class="x${i} button icon-stop" onclick="flowios[${i}].stopAllActions()" type="button" disabled title="Stop all actions"></button>
              </div>
              <div class="checkboxes">
                <input class='x${i}' type="checkbox" id="port1_chk${i}" value="1" disabled>
                <input class='x${i}' type="checkbox" id="port2_chk${i}" value="2" disabled>
                <input class='x${i}' type="checkbox" id="port3_chk${i}" value="3" disabled>
                <input class='x${i}' type="checkbox" id="port4_chk${i}" value="4" disabled>
                <input class='x${i}' type="checkbox" id="port5_chk${i}" value="5" disabled>
              </div>
          </div>
          <div style="grid-area: config;" class="configuration"><!--Begin Configuration-->
            <input disabled type="radio" class="x${i}" id="general${i}" name="config${i}" value="0" onclick="applySelectedConfiguration(flowios[${i}])">
            <label for="general${i}"  title="GENERAL"><img class="button icon-config-general marginbot"></img></label>
            <input disabled type="radio" class="x${i}" id="inf_series${i}" name="config${i}" value="1" onclick="applySelectedConfiguration(flowios[${i}])">
            <label for="inf_series${i}" title="INFLATION_SERIES"><img class="button icon-config-inf_series"></img></label>
            <input disabled type="radio" class="x${i}" id="inf_parallel${i}" name="config${i}" value="2" onclick="applySelectedConfiguration(flowios[${i}])">
            <label for="inf_parallel${i}" title="INFLATION_PARALLEL"><img class="button icon-config-inf_parallel"></img></label>
            <input disabled type="radio" class="x${i}" id="vac_series${i}" name="config${i}" value="3" onclick="applySelectedConfiguration(flowios[${i}])">
            <label for="vac_series${i}" title="VACUUM_SERIES"><img class="button icon-config-vac_series"></img></label>
            <input disabled type="radio" class="x${i}" id="vac_parallel${i}" name="config${i}" value="4" onclick="applySelectedConfiguration(flowios[${i}])">
            <label for="vac_parallel${i}" title="VACUUM_PARALLEL"><img class="button icon-config-vac_parallel"></img></label>
            <!--We can also have a button for gettin the current configuration, but it isn't
            necessary, <button id="read" onclick="getConfiguration()" type="button">Check Config</button>  -->
          </div><!--End Configuration-->
          <div style="grid-area: flowio;" class="flowiographic" id="flowiographic${i}">
            <!-- Insert the SVG graphic here -->
          </div>
        </div><!-- End Left grid-->
        <hr>
        <div class="grid-centerColumn"><!--Begin Center grid-->
          <h3 style="grid-area: title;">Scheduler</h3>
          <div style="grid-area: btns;">
            <button class="x${i} btn-scheduler" onclick="addRow(${i})" type="button" disabled>+ Add Row</button>
            <button class="x${i} btn-scheduler" onclick="deleteRow(${i})" type="button" disabled>Delete</button>
            <input type="reset" class="x${i} btn-scheduler" form="sheduleForm0" value="Reset" disabled/>
          </div>
          <form id="sheduleForm${i}" style="grid-area: tbl;" class="center">
            <table id="schedule${i}">
              <tr>
                <th>t<sub>0</sub> (ms) </th>
                <th>Action</th>
                <th>PWM</th>
                <th>Ports </th>
              </tr>
              <tr>
                <td>
                  <input disabled class="x${i} starttime" type="number" min="0" max="20000" value="2000" step="100">
                </td>
                <td>
                  <select class="action" disabled>
                      <option value="+">Inflate</option>
                      <option value="-">Vacuum</option>
                      <option value="^">Release</option>
                      <option value="!" selected>Stop</option>
                    </select>
                </td>
                <td>
                  <input disabled class="pwm" type="number" min="100" max="255" value="255" step="5">
                </td>
                <td>
                  <div>
                    <input type="checkbox" class="port1" value="1" checked disabled>
                    <input type="checkbox" class="port2" value="2" checked disabled>
                    <input type="checkbox" class="port3" value="3" checked disabled>
                    <input type="checkbox" class="port4" value="4" checked disabled>
                    <input type="checkbox" class="port5" value="5" checked disabled>
                  </div>
                </td>
              </tr>
            </table>
            <div style="grid-area: run; text-align: center;">
              <button class="x${i} btn-run " onclick="executeSequence(flowios[${i}])" disabled type="button" title="Run Sequence"> ► </button>
            </div>
          </form>
        </div><!--End Center grid-->
        <hr>
        <div class="grid-rightColumn"><!--BEGIN: Right column grid-->
          <h3>Log</h3>
          <textarea class="x${i} log" id='log${i}'></textarea>
          <div>
            <button class="btn-log" onclick="clearLog(flowios[${i}])" type="button">Clear Log</button>
          </div>
        </div><!--END: Right column grid-->
      </div><!--END: Parent grid-->
      <!--END: Main content-->
    </section>
  `;
}

function removeTab(i){
  flowios[i].destroyInstance(); //this is defined in "connectBle.js"
  //remove the HTML for theat tab https://catalin.red/removing-an-element-with-plain-javascript-remove-method/
  myTab = document.getElementById(`tab${i}`);
  myTab.parentNode.removeChild(myTab);

  //Show contents the of the previous tab by setting its checked property to true. But we can't just select the previous
  //array element, because it may have been deleted. So we must check at what index the previoius tab is located.
  let prevTab = null;
  while(prevTab==null){
    prevTab=document.getElementById(`tab${i-1}`);
    i--;
    if(i<0) prevTab="notpresent";
  }
  prevTab.getElementsByTagName('input')[0].checked=true;
}
