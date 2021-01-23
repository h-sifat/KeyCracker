{
class Component {
  state = {
    value: "",
    isActive: false,
    htmlObj: null,
    global: null,
  };

  constructor(id, value, isActive = false) {
    this.state.htmlObj = document.getElementById(id);
    this.state.isActive = isActive;
    this.state.value = value;
  }

  setValue = (valueName, value) => {
    this.state[valueName] = value;
    this.render();
  };

  getValue = (valueName) => {
    return this.state[valueName];
  };

  setActiveStatus = (status) => {
    this.state.isActive = status;
    this.render();
  };

  getActiveStatus = () => {
    return this.state.isActive;
  };

  render() {}
}

// Timer component
class Timer extends Component {
  constructor(id, value, isActive, DOM) {
    super(id, value, isActive);
    this.state.seconds = value * 60;
    this.state.run = false;
    this.state.elapsedSeconds = 0;
    this.state.DOM = DOM;
    this.render();
  }

  formatValue = () => {
    let seconds = this.state.seconds;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  setMinutes = (minutes) => {
    if(minutes === 0 || minutes > 10)
      minutes = 1;
    this.state.value = minutes;
    this.state.seconds = minutes * 60;
    this.state.elapsedSeconds = 0;
    this.render();
  };

  start = (callback) => {
    this.state.callback = callback;
    this.state.run = true;
    this.doStart();
  };

  doStart() {
    if (!this.state.run || this.state.seconds < 1) return this.state.callback();
    setTimeout(() => {
      this.state.elapsedSeconds++;
      this.state.seconds--;
      this.render();
      this.doStart();
    }, 1000);
  }

  stop = (callback) => {
    this.state.run = false;
    if (callback) setTimeout(callback, 1000);
  };

  render() {
    const { isActive, htmlObj, value, seconds, DOM } = this.state;
    const percent = Math.floor((100 / (value * 60)) * seconds);

    if (isActive) {
      htmlObj.classList.add("active");
    } else {
      if (htmlObj.classList.contains("active"))
        htmlObj.classList.remove("active");
    }
    DOM.style.setProperty("--timerWidth", percent + "%");
    DOM.style.setProperty("--timerColor", `hsl(${percent}, 100%, 50%)`);
    htmlObj.innerText = this.formatValue();
  }
}

class SwitchBtn extends Component {
  constructor(id, value = "", isActive = false) {
    super(id, value, isActive);
    this.render();
  }

  render() {
    const { isActive, htmlObj } = this.state;
    if (isActive) {
      htmlObj.classList.add("active");
      htmlObj.style.backgroundColor = "#ff2c2c";
    } else {
      if (htmlObj.classList.contains("active"))
        htmlObj.classList.remove("active");
      htmlObj.style.backgroundColor = "#45bf62";
    }
    htmlObj.innerText = isActive ? "Stop" : "Start";
  }
}

class MS extends Component {
  constructor(id, value, isActive, DOM) {
    super(id, value, isActive);
    this.state.currentValue = 250;
    this.render();
  }

  resetWidth = () => {
    DOM.style.setProperty("--msWidth", "0%");
  };

  render() {
    const { isActive, htmlObj, currentValue, value } = this.state;
    const percent = Math.floor((100 / 250) * currentValue);
    if (isActive) {
      htmlObj.classList.add("active");
    } else {
      if (htmlObj.classList.contains("active"))
        htmlObj.classList.remove("active");
    }
    DOM.style.setProperty("--msTargetWidth", (value * 100) / 250 + "%");
    DOM.style.setProperty("--msWidth", (percent > 100 ? 100 : percent) + "%");
    DOM.style.setProperty("--msColor", `hsl(${100 - percent}, 100%, 50%)`);
    htmlObj.title = `Your target is: ${value}ms`;
    htmlObj.innerText = currentValue + "ms";
    setTimeout(this.resetWidth, 90);
  }
}

class Letter extends Component {
  constructor(id, value, isActive) {
    super(id, value, isActive);
    this.state.value = value;
    this.state.isActive = isActive;
    this.render();
  }

  click = () => {
    this.state.htmlObj.classList.add("clicked");
    setTimeout(() => {
      this.state.htmlObj.classList.remove("clicked");
    }, 150);
  };

  render() {
    const { isActive, htmlObj, value } = this.state;
    if (isActive) {
      htmlObj.classList.add("active");
    } else {
      if (htmlObj.classList.contains("active"))
        htmlObj.classList.remove("active");
    }
    htmlObj.innerText = value;
  }
}

class Report extends Component {
  constructor(id, value, ms) {
    super(id, value);
    this.state.ave = 0;
    this.state.min = Infinity;
    this.state.kpc = 0;
    this.state.count = 0;
    this.state.ms = ms;
    this.render();
  }

  reset() {
    this.state.ave = 0;
    this.state.min = Infinity;
    this.state.kpc = 0;
    this.state.count = 0;
    this.state.value = 0;
    this.render();
  }

  update = (val) => {
    this.state.value += val;
    this.state.count++;

    const { min, kpc, ave, value, count } = this.state;
    this.state.kpc = Math.floor(count / (value / 1000));
    if (val < min) this.state.min = val;
    this.state.ave = Math.floor(value / count);
    this.render();
  };

  render() {
    const { min, kpc, ave, count } = this.state;
    const childrens = this.state.htmlObj.children;
    childrens[0].innerText = count;
    childrens[1].innerText = ave + "ms";
    childrens[1].style.color =
      this.state.ms.getValue("value") > ave ? "green" : "red";
    childrens[2].innerText = (min === Infinity ? 0 : min) + "ms";
    childrens[3].innerText = kpc;
  }
}

const audio = {
  audios: document.getElementById("audio").children,
  play(num) {
    if (isMuted) return;
    this.audios[num].currentTime = 0;
    this.audios[num].play();
  },
};

const DOM = document.documentElement;

const elements = {};
elements.switchBtn = new SwitchBtn("switchBtn");
elements.timer = new Timer("timer", 1, false, DOM);
elements.letter = new Letter("letter", "a", false);
elements.ms = new MS("ms", 150, false, DOM);
const report = new Report("resultText", 0, elements.ms);
const input = document.getElementById("input");

let currentLetter = "a";
let isKeyPressed = false;
let inputVal = "";
let selectedItem = "";
let practching = false;
let keydown = 0;
let keyPressTime = 0;
let lastStopBtnClick = 0;
let stopBtnRunning = false;
let isMuted = false;
const clickableIds = ["letter", "timer", "ms", "switchBtn"];

function allVarReset() {
  isKeyPressed = false;
  selectedItem = "";
  practching = false;
  keydown = 0;
  keyPressTime = 0;
}

// Enter - 13
// Pause  / break - 19
// Escape - 27
window.addEventListener("keydown", (key) =>
  practching ? listenKeyDown(key) : takeInput(key)
);
window.addEventListener("keyup", (key) =>
  isKeyPressed ? listenKeyUp(key) : () => {}
);

container.addEventListener("click", (e) => {
  const id = event.target.id;
  if (!clickableIds.includes(id)) return;

  if (id === "switchBtn") {
    if (elements.switchBtn.getActiveStatus()) {
      lastStopBtnClick = Date.now();

      if (stopBtnRunning) return;

      stopBtnRunning = true;
      setTimeout(() => {
        const gap = Date.now() - lastStopBtnClick;
        elements.timer.stop(
          gap < 250 ? () => elements.timer.setMinutes(1) : undefined
        );
        elements.switchBtn.setActiveStatus(false);
        input.disabled = false;
        allVarReset();
        stopBtnRunning = false;
        audio.play(3);
      }, 250);
    } else {
      audio.play(0);
      // console.log("I'm here");
      if (elements.timer.state.elapsedSeconds === 0) report.reset();
      practching = true;
      elements.timer.start(stopCallback);
      elements.switchBtn.setActiveStatus(true);
      input.disabled = true;
      audio.play(0);
    }
  }

  if (practching) return;
  if (selectedItem) return deactivateItem();

  selectedItem = id;
  activateItem();
});

function stopCallback() {
  allVarReset();
  audio.play(3);
  input.disabled = false;
  elements.timer.setMinutes(1);
  elements.switchBtn.setActiveStatus(false);
}

function activateItem() {
  elements[selectedItem].setActiveStatus(true);
}

function deactivateItem() {
  // console.log(selectedItem);
  elements[selectedItem].setActiveStatus(false);
}

function takeInput({ keyCode }) {
  if (keyCode !== 13) return;
  inputVal = input.value;
  input.value = "";

  if (!selectedItem) {
    if (inputVal === "s=0" || inputVal === "s=1")
      isMuted = inputVal === "s=0" ? true : false;

    return;
  }

  if (selectedItem === "letter") {
    const isValid = /^[a-zA-Z]{1}$/.test(inputVal);
    if (isValid) elements.letter.setValue("value", inputVal);
    currentLetter = inputVal;
  } else if (selectedItem === "timer") {
    const isValid = /^\d{1}$/.test(inputVal);
    if (isValid) elements.timer.setMinutes(parseInt(inputVal, 10));
  } else {
    const isValid = /^\d{1,3}$/.test(inputVal);
    const milliSec = parseInt(inputVal, 10);
    if (isValid)
      elements.ms.setValue("value", milliSec >= 245 ? 245 : milliSec);
  }

  deactivateItem();
  selectedItem = "";
}

function listenKeyDown({ key }) {
  if (key === currentLetter && !isKeyPressed) {
    audio.play(Math.floor(Math.random() * 2) + 1);
    keydown = Date.now();
    isKeyPressed = true;
    elements.letter.click();
  }
}

function listenKeyUp() {
  keyPressTime = Date.now() - keydown;
  report.update(keyPressTime);
  elements.ms.setValue("currentValue", keyPressTime > 998 ? 999 : keyPressTime);
  isKeyPressed = false;
}
}
