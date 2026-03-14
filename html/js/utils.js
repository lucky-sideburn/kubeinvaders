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

/* Utility Functions */

function parseNamespacesInput(input) {
  if (!input) {
    return [];
  }

  return input
    .split(',')
    .map(function (ns) {
      return ns.trim();
    })
    .filter(function (ns) {
      return ns !== '';
    });
}

function normalizeK8sEndpoint(rawEndpoint) {
  if (!rawEndpoint) {
    return null;
  }

  var endpoint = rawEndpoint.trim();
  if (endpoint === '') {
    return null;
  }

  if (!/^https?:\/\//i.test(endpoint)) {
    endpoint = 'https://' + endpoint;
  }

  var parsedUrl;
  try {
    parsedUrl = new URL(endpoint);
  } catch (error) {
    return null;
  }

  if (!parsedUrl.hostname) {
    return null;
  }

  // Keep protocol, host, port and optional base path, but remove trailing slash.
  return (parsedUrl.origin + parsedUrl.pathname).replace(/\/+$/, '');
}

function getK8sTargetUrl() {
  var endpointInput = document.getElementById('k8s_api_endpoint');
  var storedEndpoint = localStorage.getItem('k8s_api_endpoint') || '';
  var rawEndpoint = endpointInput && endpointInput.value.trim() !== ''
    ? endpointInput.value.trim()
    : storedEndpoint;

  var normalizedEndpoint = normalizeK8sEndpoint(rawEndpoint);
  if (!normalizedEndpoint) {
    throw new Error('Invalid Kubernetes API endpoint. Use a full endpoint like https://localhost:6443 or http://kubernetes.default.svc');
  }

  if (endpointInput) {
    endpointInput.value = normalizedEndpoint;
  }

  return normalizedEndpoint;
}

function buildNetworkErrorMessage(targetUrl, action) {
  var message = action + ' failed: network error while reaching ' + targetUrl + '/healthz.';
  if (/^https:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(targetUrl)) {
    return message + ' Possible cause: TLS certificate is not trusted (ERR_CERT_AUTHORITY_INVALID). Browsers cannot ignore invalid TLS certificates for XHR requests.';
  }

  return message + ' Possible causes: DNS error (ERR_NAME_NOT_RESOLVED), TLS certificate issue, or unreachable endpoint.';
}

function getK8sCaCert() {
  var caCertInput = document.getElementById('k8s_ca_cert');
  if (!caCertInput) {
    return '';
  }

  return caCertInput.value || '';
}

function getK8sToken() {
  var tokenInput = document.getElementById('k8s_token');
  var inputVal = tokenInput ? tokenInput.value : '';
  var storageVal = localStorage.getItem('k8s_token') || '';
  var result = inputVal || storageVal;
  console.log('[K8S-TOKEN] inputElement exists=' + !!tokenInput + ', inputVal.length=' + inputVal.length + ', storageVal.length=' + storageVal.length + ', result.length=' + result.length);
  return result;
}

function getStoredK8sConnectionConfig() {
  var endpointInput = document.getElementById('k8s_api_endpoint');
  var inputEndpoint = endpointInput ? endpointInput.value.trim() : '';
  var storedEndpoint = (localStorage.getItem('k8s_api_endpoint') || '').trim();
  var normalizedInputEndpoint = normalizeK8sEndpoint(inputEndpoint);
  var normalizedStoredEndpoint = normalizeK8sEndpoint(storedEndpoint);

  return {
    target: normalizedInputEndpoint || normalizedStoredEndpoint || '',
    token: getK8sToken().trim(),
    caCert: getK8sCaCert()
  };
}

function appendK8sTargetParam(url) {
  var cfg = getStoredK8sConnectionConfig();
  if (!cfg.target) {
    return url;
  }

  var separator = url.indexOf('?') === -1 ? '?' : '&';
  return url + separator + 'target=' + encodeURIComponent(cfg.target);
}

function applyK8sConnectionHeaders(xhr) {
  var cfg = getStoredK8sConnectionConfig();
  console.log('[K8S-HEADERS] target=' + (cfg.target || '<empty>') + ', token.length=' + (cfg.token ? cfg.token.length : 0) + ', caCert.length=' + (cfg.caCert ? cfg.caCert.length : 0));

  if (cfg.target) {
    xhr.setRequestHeader('X-K8S-Target', cfg.target);
  }

  xhr.setRequestHeader('X-K8S-Token', cfg.token || '');

  if (cfg.caCert) {
    try {
      xhr.setRequestHeader('X-K8S-CA-CERT-B64', btoa(cfg.caCert));
    } catch (error) {
      console.warn('[K8S-CONNECTION] Unable to encode CA cert header', error);
    }
  }
}

function requestBackendHealthz(targetUrl, action, caCert) {
  return new Promise(function(resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.timeout = 5000;

    oReq.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE) {
        var payload = null;
        try {
          payload = this.responseText ? JSON.parse(this.responseText) : null;
        } catch (error) {
          payload = null;
        }

        if (this.status === 200 && (!payload || payload.ok === true)) {
          resolve(payload || true);
        } else {
          var errorDetails = '';
          if (payload && payload.error) {
            errorDetails = ' (' + payload.error + ')';
          } else if (payload && payload.body) {
            errorDetails = ' (' + payload.body + ')';
          } else if (this.responseText) {
            errorDetails = ' (' + this.responseText + ')';
          }

          reject(new Error(action + ' failed with status: ' + this.status + errorDetails));
        }
      }
    };

    oReq.ontimeout = function() {
      reject(new Error(action + ' timeout'));
    };

    oReq.onerror = function() {
      reject(new Error(buildNetworkErrorMessage(targetUrl, action)));
    };

    oReq.open('POST', '/kube/healthz', true);
    oReq.setRequestHeader('Content-Type', 'application/json');
    oReq.send(JSON.stringify({
      target: targetUrl,
      ca_cert: caCert || ''
    }));
  });
}

var connectionStatusHideTimers = {};

function clearConnectionStatus(prefix) {
  prefix = prefix || 'k8s-connection';
  var statusDiv = document.getElementById(prefix + '-status');
  var successDiv = document.getElementById(prefix + '-success');
  var errorDiv = document.getElementById(prefix + '-error');
  var errorMsgSpan = document.getElementById(prefix + '-error-msg');

  if (connectionStatusHideTimers[prefix]) {
    clearTimeout(connectionStatusHideTimers[prefix]);
    connectionStatusHideTimers[prefix] = null;
  }

  if (statusDiv) statusDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'none';
  if (errorMsgSpan) errorMsgSpan.textContent = '';
}

function showConnectionStatus(message, isError, prefix, autoHideDelay) {
  prefix = prefix || 'k8s-connection';
  var statusDiv = document.getElementById(prefix + '-status');
  var successDiv = document.getElementById(prefix + '-success');
  var errorDiv = document.getElementById(prefix + '-error');
  var errorMsgSpan = document.getElementById(prefix + '-error-msg');

  if (!statusDiv) {
    console.log('[K8S-CONNECTION] ' + message);
    return;
  }

  statusDiv.style.display = 'block';
  if (successDiv) successDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'none';

  if (connectionStatusHideTimers[prefix]) {
    clearTimeout(connectionStatusHideTimers[prefix]);
    connectionStatusHideTimers[prefix] = null;
  }

  if (isError) {
    if (errorDiv) errorDiv.style.display = 'block';
    if (errorMsgSpan) errorMsgSpan.textContent = message;
  } else {
    if (successDiv) successDiv.style.display = 'block';
  }

  if (autoHideDelay && autoHideDelay > 0) {
    connectionStatusHideTimers[prefix] = setTimeout(function () {
      clearConnectionStatus(prefix);
    }, autoHideDelay);
  }
}

function testK8sConnectionRequest() {
  return new Promise((resolve, reject) => {
    var targetUrl;
    var caCert = getK8sCaCert();
    try {
      targetUrl = getK8sTargetUrl();
    } catch (error) {
      reject(error);
      return;
    }

    requestBackendHealthz(targetUrl, 'Connection test', caCert)
      .then(function () {
        resolve(true);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function saveK8sConnectionRequest() {
  return new Promise((resolve, reject) => {
    const namespacesInput = document.getElementById('k8s_namespaces');
    const namespacesRaw = namespacesInput ? namespacesInput.value.trim() : '';
    const caCert = getK8sCaCert();
    let targetUrl;

    try {
      targetUrl = getK8sTargetUrl();
    } catch (error) {
      reject(error);
      return;
    }

    // Persist everything immediately so token/endpoint survive page reloads
    // even if the healthz probe fails.
    localStorage.setItem('k8s_api_endpoint', targetUrl);
    localStorage.setItem('k8s_namespaces', namespacesRaw);
    localStorage.setItem('k8s_ca_cert', caCert);
    var tokenVal = getK8sToken();
    localStorage.setItem('k8s_token', tokenVal);
    configured_namespaces = parseNamespacesInput(namespacesRaw);

    requestBackendHealthz(targetUrl, 'Save', caCert)
      .then(function () {
        resolve(true);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function testK8sConnection() {
  clearConnectionStatus('k8s-connection');

  return testK8sConnectionRequest()
    .then(function () {
      showConnectionStatus('Connection test succeeded.', false, 'k8s-connection', 3000);
      return true;
    })
    .catch(function (error) {
      showConnectionStatus(error.message, true, 'k8s-connection', 3000);
      return false;
    });
}

function saveK8sConnection() {
  clearConnectionStatus('k8s-save');

  return saveK8sConnectionRequest()
    .then(function () {
      if (typeof setSystemSettings === 'function') {
        setSystemSettings();
      }
      if (typeof getEndpoint === 'function') {
        getEndpoint();
      }
      if (typeof getNamespaces === 'function') {
        getNamespaces();
      }

      showConnectionStatus('', false, 'k8s-save', 3000);
      return true;
    })
    .catch(function (error) {
      showConnectionStatus(error.message, true, 'k8s-save', 3000);
      return false;
    });
}

document.addEventListener("DOMContentLoaded", function() {
  // Migrate old localStorage key name used in earlier versions
  var legacyK8sUrl = localStorage.getItem("k8s_url");
  if (legacyK8sUrl && !localStorage.getItem("k8s_api_endpoint")) {
    localStorage.setItem("k8s_api_endpoint", legacyK8sUrl);
    localStorage.removeItem("k8s_url");
  }

  var endpointInput = document.getElementById("k8s_api_endpoint");
  var namespacesInput = document.getElementById("k8s_namespaces");
  var caCertInput = document.getElementById("k8s_ca_cert");
  var tokenInput = document.getElementById("k8s_token");
  var storedK8sUrl = localStorage.getItem("k8s_api_endpoint");
  var storedNamespaces = localStorage.getItem("k8s_namespaces");
  var storedCaCert = localStorage.getItem("k8s_ca_cert");
  var storedToken = localStorage.getItem("k8s_token");

  if (endpointInput) {
    endpointInput.value = storedK8sUrl || '';
  }

  if (namespacesInput) {
    namespacesInput.value = storedNamespaces || "";
  }

  if (caCertInput) {
    caCertInput.value = storedCaCert || "";
  }

  if (tokenInput && storedToken) {
    tokenInput.value = storedToken;
  }

  // Auto-persist token whenever the user types in the field
  if (tokenInput) {
    tokenInput.addEventListener('input', function () {
      localStorage.setItem('k8s_token', tokenInput.value);
    });
  }

  configured_namespaces = parseNamespacesInput(storedNamespaces || "");

  setTimeout(function() {
      var splashScreen = document.getElementById("splash-screen");
      var mainGameDiv = document.getElementById("main-game-div");

      if (splashScreen) {
        splashScreen.style.display = "none";
      }

      if (mainGameDiv) {
        mainGameDiv.style.display = "block";
      }
  }, 2000);
});

function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

function contains(a, obj) {
  for (var i = 0; i < a.length; i++) {
      if (a[i] === obj) {
          return true;
      }
  }
  return false;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function rand_id() {
  return getRandomInt(9999);
}

function formattedToday() {
  const today = new Date();
  return today
}

function convertStringToArrayWithSeparator(str, separator) {
  return String(str).split(separator);
}

function demo_mode_alert() {
  alert("This is a demo mode installed into the k8s cluster of platformengineering.it, some features are disabled.");
}

function is_demo_mode() {
  return demo_mode;
}

function sanitizeStringToURLFriendly(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}


function kubePingModalSwitch() {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("[K-INV STARTUP] kubeping status is: |" + this.responseText.trim() + "|");
        if (this.responseText.trim() == "Key not found" || is_demo_mode()) {
          setModalState(true)
          showKubePingModal()
        }
      }
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=kubeping", true);
  oReq.send();
}

function setKubePingStatusPing(value) {
  var oReq = new XMLHttpRequest();

  if (value == 1) {
    oReq.open("POST", k8s_url + "/chaos/redis/set?key=kubeping&msg=" + sanitizeStringToURLFriendly(document.getElementById("kubePingJsonTextArea").value), true);  
  } 
  else {
    oReq.open("POST", k8s_url + "/chaos/redis/set?key=kubeping", true);  
  }

  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        kubeping_sent = true;
      }
  };;
  oReq.setRequestHeader("Content-Type", "application/text");
  oReq.send(String(value));
  closeKubePingModal();
}