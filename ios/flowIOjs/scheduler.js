window.onload = function(){
  addRow(0); //we are creating the firt row of the table dynamically on load.
};

function executeSequence(flowio){
  flowio.log("Executing Sequence...")
  let i = flowio.instanceNumber;
  //1. Access the schedule table.
  //2. Read the time, action, and selected ports for the first data row (which is the second
  //  row of the table, but row numbers start from 0, so it is row number "1" anyways.)
  //3. Send the parameters obtained in step 2 to the executeAction() function.
  //4. Repeat the last two steps until all rows of the table are read.
  let scheduleTable = document.getElementById(`schedule${i}`);
  let rows=scheduleTable.rows.length; //because the title row is not a line item.

  let startTimes = document.querySelectorAll(`#schedule${i} .starttime`); //creates an array of all the times.
  let actions = document.querySelectorAll(`#schedule${i} .action`); //creates an array of all the actions.
  let port1 = document.querySelectorAll(`#schedule${i} .port1`); //creates an array of all port1 states.
  let port2 = document.querySelectorAll(`#schedule${i} .port2`); //creates an array of all port2 states.
  let port3 = document.querySelectorAll(`#schedule${i} .port3`); //creates an array of all port3 states.
  let port4 = document.querySelectorAll(`#schedule${i} .port4`); //creates an array of all port4 states.
  let port5 = document.querySelectorAll(`#schedule${i} .port5`); //creates an array of all port5 states.

  let pwmVals = document.querySelectorAll(`#schedule${i} .pwm`); //creates an array of all PWM values in the the able.

  //#########---Validate if time entris are in order---############
  //This section is optional and purely for catching user entry problems.
  let startTimePrev=0;
  for(let i=0; i<startTimes.length; i++){ //index 1 is our 1st data item in the table.
    let startTime = parseInt(startTimes[i].value);
    if(startTime<startTimePrev){
      flowio.log(`Aborted - Task #${i+1} out of order.`)
      return;
    }
    startTimePrev = startTime;
  }
  //#################---Validation Complete---######################

  for(let i=0; i<startTimes.length; i++){
    let p1=port1[i].checked;
    let p2=port2[i].checked;
    let p3=port3[i].checked;
    let p4=port4[i].checked;
    let p5=port5[i].checked;

    let portsByte = getPortsByte(p1,p2,p3,p4,p5); //each input is either true or false.
    let pwmVal = pwmVals[i].value;
    let startTime = startTimes[i].value;
    let action = actions[i].value;
    if(portsByte==0){
       flowio.log("You did not select any ports on row " + `${i+1}`);
    }
    else{
      executeAction(flowio, startTime, action, portsByte, pwmVal);
    }
  }
  flowio.log("");
}

function executeAction(flowio, time,action,portsByte,pwmVal){ //the time specifies AT WHICH TIME the action will begin, NOT the duration of the action.
  let array3byte = new Uint8Array(3);
  if(action=="+")        array3byte[0] = 0x2b; //'+'
  else if(action == "-") array3byte[0] = 0x2d; //'-'
  else if(action == "^") array3byte[0] = 0x5e; //'^'
  else                   array3byte[0] = 0x21; //'!'

  array3byte[1] = portsByte;
  array3byte[2] = pwmVal;
  setTimeout(async function(){await flowio.controlService.chrCommand.writeValue(array3byte);}, parseInt(time));
  // setTimeout(async function(){await flowio.writeCommand(action, portsByte, pwmVal);}, parseInt(time));
}

function getPortsByte(p1,p2,p3,p4,p5){
  let portsByte = 0x00;
  if(p1) portsByte ^= 0x01; //0 0001
  if(p2) portsByte ^= 0x02; //0 0010
  if(p3) portsByte ^= 0x04; //0 0100
  if(p4) portsByte ^= 0x08; //0 1000
  if(p5) portsByte ^= 0x10; //1 0000
  return portsByte;
}

//#############---CALLBACKS---###################
function deleteRow(instanceNumber){ //delete the previous to the last row.
  let i = instanceNumber; //argument is the flowio instance number (first one is #0)
  let scheduleTable = document.getElementById(`schedule${i}`);
  let n=scheduleTable.rows.length;
  if(n>2) scheduleTable.deleteRow(n-2); //the first row is the title row, and is row 0.
}
function addRow(instanceNumber) {
  let i = instanceNumber; //argument is the flowio instance number (first one is #0)
  let scheduleTable = document.getElementById(`schedule${i}`);

  let n=scheduleTable.rows.length-1; //the first row of the table is title row.
  let row = scheduleTable.insertRow(n); //I want to add the new row before the last one.
  //log(n);

  //TODO: There is a dilemma here. I need the input elements to be disabled initially, and when the initial row is created onload, I want it to be
  //disabled. But then after I connect to the device and add new row, I want that new row to not be disabled. Thus, I can put "disabled" parameter
  //to achieve (1), but then I also have it be disabled each time I add a new row which is not what I want. Conversely, if I don't put "disabled" then
  //the row created onload will not be disabled. One way to solve this is to have the first row NOT be created by the JS but hard-coded in HTML.
  //Then I can remove the onload function altogether.
  //Another solution is to check if I am connected and then have a variable ${var} be inserted, where
  //if disconnected var="disabled"
  //if connected var =""
  //Having the first row be NOT disabled is actually fine, because this is only so on initial page load. If I connect and disconnect, then it IS disabled
  //because of the x0 class. So I can just leave it like this.

  //TODO: I don't like the fact that I have to put x0 in each input field. Because that will complicate how I put schedulers in
  //my other tabs. But if I do it this way, I should then insert not x0 but x${i} where i will be passed as an argument to the addRow(i) function.
  //directly from the HTML.
  row.insertCell(0).innerHTML = `<input class="x${i} starttime" type="number" min="0" max="200000" value="0" step="100">`;
  row.insertCell(1).innerHTML = `
                    <select class="x${i} action">
                      <option value="+">Inflate</option>
                      <option value="-">Vacuum</option>
                      <option value="^">Release</option>
                      <option value="!">Stop</option>
                      <option value="">Open</option>
                      <option value="">Close</option>
                    </select>
                    `;
  row.insertCell(2).innerHTML = `<input class="x${i} pwm" type="number" min="100" max="255" value="255" step="5">`;
  row.insertCell(3).innerHTML = `
              <div>
                <input type="checkbox" class="x${i} port1" value="1">
                <input type="checkbox" class="x${i} port2" value="2">
                <input type="checkbox" class="x${i} port3" value="3">
                <input type="checkbox" class="x${i} port4" value="4">
                <input type="checkbox" class="x${i} port5" value="5">
              </div>
              `;
}
