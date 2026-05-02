/*
 * Copyright 2024 KubeInvaders Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/* Mode Controls */

function startGameMode() {
  if (game_mode_switch) {
    game_mode_switch = false;
    $("#gameModeButton").html('<i class="fas fa-gamepad me-2"></i>Enable Game Mode');
  } else {
    /* TO DO: DO BETTER :D */
    let checkbox = {
      checked: true,
    };
    let close_button = document.getElementById("closeButtonReport");
    close_button.innerHTML = "Skip";
    showPrepareChaosReportModal(checkbox);
    game_mode_switch = true;
    document.getElementById("gameContainer").style.width = "100%";
    document.getElementById("gameContainer").style.height = "100%";
    //document.getElementById("loadButtonGroup").style.width = "650px";
    $("#gameModeButton").html('<i class="fas fa-gamepad me-2"></i>Disable Game Mode');
    $("#programmingModeButton").html('<i class="fas fa-code me-2"></i>Programming Mode');
    programming_mode_switch = false;
  }
  if (game_buttons.style.display === "none") {
    game_buttons.style.display = "block";
  } else {
    game_buttons.style.display = "none";
  }
  if (game_screen.style.display === "none") {
    game_screen.style.display = "block";
  } else {
    game_screen.style.display = "none";
  }
  chaos_program_screen.style.display = "none";
  programming_mode_buttons.style.display = "none";
  resizeCharts();
  let canvasElement = document.getElementById("myCanvas");
  if (canvasElement) {
      canvasElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function startProgrammingMode() {
  kubePingModalSwitch();
  if (is_demo_mode()) {
    demo_mode_alert();
    return;
  }

  if (programming_mode_switch) {
    programming_mode_switch = false;
    $("#programmingModeButton").text("Enable Prog. Mode");
  } else {
    document.getElementById("gameContainer").style.width = "100%";
    document.getElementById("gameContainer").style.height = "100%";
    document.getElementById("loadButtonGroup").style.width = "1250px";

    programming_mode_switch = true;
    game_mode_switch = false;
    $("#gameModeButton").text("Enable Game Mode");
    $("#programmingModeButton").text("Disable Prog. Mode");
  }
  if (chaos_program_screen.style.display === "none") {
    chaos_program_screen.style.display = "block";
  } else {
    chaos_program_screen.style.display = "none";
  }
  if (programming_mode_buttons.style.display === "none") {
    programming_mode_buttons.style.display = "block";
  } else {
    programming_mode_buttons.style.display = "none";
  }
  game_buttons.style.display = "none";
  game_screen.style.display = "none";

  if (editor == null) {
    editor = CodeMirror.fromTextArea(chaosProgramTextArea, {
      lineNumbers: true,
      theme: "dracula",
      mode: "yaml",
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: false,
      extraKeys: { "Tab": "indentMore", "Shift-Tab": "indentLess" }
    });
    editor.setSize("100%", "820px");
  }
}