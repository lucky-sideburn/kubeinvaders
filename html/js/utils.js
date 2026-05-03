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

function loadKubeconfigFile(event) {
  var file = event.target.files[0];
  if (!file) return;

  var filenameSpan = document.getElementById('kubeconfig_filename');
  var statusDiv = document.getElementById('kubeconfig-load-status');
  var successDiv = document.getElementById('kubeconfig-load-success');
  var errorDiv = document.getElementById('kubeconfig-load-error');

  if (filenameSpan) filenameSpan.textContent = file.name;
  if (statusDiv) statusDiv.style.display = 'none';
  if (successDiv) { successDiv.style.display = 'none'; successDiv.textContent = ''; }
  if (errorDiv) { errorDiv.style.display = 'none'; errorDiv.textContent = ''; }

  var reader = new FileReader();
  reader.onload = function(e) {
    var kubeconfig;
    try {
      kubeconfig = jsyaml.load(e.target.result);
    } catch (err) {
      showKubeconfigStatus('Failed to parse KUBECONFIG: ' + err.message, true);
      return;
    }

    if (!kubeconfig || typeof kubeconfig !== 'object') {
      showKubeconfigStatus('Invalid KUBECONFIG file.', true);
      return;
    }

    var currentContextName = kubeconfig['current-context'];
    var contexts = kubeconfig.contexts || [];
    var contextEntry = contexts.find(function(c) { return c.name === currentContextName; }) || contexts[0];

    if (!contextEntry) {
      showKubeconfigStatus('No context found in KUBECONFIG.', true);
      return;
    }

    var ctx = contextEntry.context || {};
    var clusterName = ctx.cluster;
    var userName = ctx.user;
    var namespace = ctx.namespace || '';

    var clusters = kubeconfig.clusters || [];
    var clusterEntry = clusters.find(function(c) { return c.name === clusterName; });
    var clusterData = clusterEntry ? (clusterEntry.cluster || {}) : {};

    var users = kubeconfig.users || [];
    var userEntry = users.find(function(u) { return u.name === userName; });
    var userData = userEntry ? (userEntry.user || {}) : {};

    var server = clusterData.server || '';
    var caCertB64 = clusterData['certificate-authority-data'] || '';
    var caCertFilePath = clusterData['certificate-authority'] || '';
    var token = userData.token || userData['token-data'] || '';
    var usesClientCert = !token && (
      userData['client-certificate'] || userData['client-certificate-data'] ||
      userData['exec']
    );

    var caCert = '';
    if (caCertB64) {
      try {
        caCert = atob(caCertB64);
      } catch (_) {
        caCert = caCertB64;
      }
    }

    var endpointInput = document.getElementById('k8s_api_endpoint');
    var tokenInput = document.getElementById('k8s_token');
    var caCertInput = document.getElementById('k8s_ca_cert');
    var namespacesInput = document.getElementById('k8s_namespaces');

    if (endpointInput && server) endpointInput.value = server;
    if (tokenInput && token) { tokenInput.value = token; localStorage.setItem('k8s_token', token); }
    if (caCertInput) caCertInput.value = caCert;
    if (namespacesInput && namespace && !namespacesInput.value) namespacesInput.value = namespace;

    if (server) localStorage.setItem('k8s_api_endpoint', server);
    if (caCert) localStorage.setItem('k8s_ca_cert', caCert);

    if (usesClientCert) {
      var ns = namespace || 'default';
      var cmds = [
        'kubectl create serviceaccount kubeinvaders -n ' + ns,
        'kubectl create clusterrolebinding kubeinvaders \\',
        '  --clusterrole=cluster-admin \\',
        '  --serviceaccount=' + ns + ':kubeinvaders',
        'kubectl create token kubeinvaders -n ' + ns
      ];
      var caCertWarning = (!caCert && caCertFilePath)
        ? '<br><br><strong>CA certificate:</strong> your kubeconfig references a local file (<code>' +
          escapeHtml(caCertFilePath) + '</code>) that cannot be read by the browser. ' +
          'Paste its contents manually into the CA Certificate field above.'
        : '';
      var statusDiv = document.getElementById('kubeconfig-load-status');
      var errorDiv = document.getElementById('kubeconfig-load-error');
      var successDiv = document.getElementById('kubeconfig-load-success');
      if (statusDiv) statusDiv.style.display = 'block';
      if (successDiv) successDiv.style.display = 'none';
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML =
          'Endpoint loaded (context: <strong>' + contextEntry.name + '</strong>), but no token found.<br>' +
          'This context uses client-certificate auth, which is not supported directly.<br>' +
          'We suggest running these commands to create a <strong>cluster-admin</strong> service account token:<br><br>' +
          '<code style="display:block; background:#f0f0f0; color:#222; padding:8px 10px; border-radius:4px; white-space:pre-wrap; overflow-wrap:break-word; font-size:12px;">' +
          cmds.map(function(c) { return escapeHtml(c); }).join('\n') +
          '</code>' +
          '<button type="button" onclick="copyKubeconfigCommands(this)" ' +
          'data-commands="' + escapeAttr(cmds.join('\n')) + '" ' +
          'style="margin-top:8px; font-size:12px; padding:3px 10px;">Copy commands</button>' +
          caCertWarning;
      }
      return;
    }

    var loaded = [];
    if (server) loaded.push('endpoint');
    if (token) loaded.push('token');
    if (caCert) loaded.push('CA cert');
    var contextLabel = contextEntry.name ? ' (context: ' + contextEntry.name + ')' : '';
    var msg = 'Loaded ' + loaded.join(', ') + contextLabel + '.';
    if (!caCert && caCertFilePath) {
      msg += '\nCA certificate references a local file (' + caCertFilePath + ') — paste it manually into the CA Certificate field.';
    }

    showKubeconfigStatus(msg, false);
  };
  reader.readAsText(file);
}

function showKubeconfigStatus(message, isError) {
  var statusDiv = document.getElementById('kubeconfig-load-status');
  var successDiv = document.getElementById('kubeconfig-load-success');
  var errorDiv = document.getElementById('kubeconfig-load-error');
  if (!statusDiv) return;
  statusDiv.style.display = 'block';
  if (isError) {
    if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.textContent = message; }
    if (successDiv) successDiv.style.display = 'none';
  } else {
    if (successDiv) { successDiv.style.display = 'block'; successDiv.textContent = message; }
    if (errorDiv) errorDiv.style.display = 'none';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function copyKubeconfigCommands(btn) {
  var commands = btn.getAttribute('data-commands');
  navigator.clipboard.writeText(commands).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  }).catch(function() {
    var ta = document.createElement('textarea');
    ta.value = commands;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

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
      showDemoDeployBlock();
      return true;
    })
    .catch(function (error) {
      showConnectionStatus(error.message, true, 'k8s-save', 3000);
      return false;
    });
}

function showDemoDeployBlock() {
  var block = document.getElementById('demo-deploy-block');
  if (block) {
    block.style.display = 'block';
  }
}

function deployDemoResources() {
  var btn = document.getElementById('demo-deploy-btn');
  var statusDiv = document.getElementById('demo-deploy-status');
  var successDiv = document.getElementById('demo-deploy-success');
  var errorDiv = document.getElementById('demo-deploy-error');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Deploying...';
  }

  var url = appendK8sTargetParam('/kube/demo/deploy');
  var oReq = new XMLHttpRequest();
  oReq.open('POST', url, true);
  applyK8sConnectionHeaders(oReq);
  oReq.timeout = 30000;

  oReq.onreadystatechange = function () {
    if (this.readyState !== XMLHttpRequest.DONE) return;

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Deploy ns-1 & ns-2 (10 pods each)';
    }

    statusDiv.style.display = 'block';
    var payload = null;
    try { payload = JSON.parse(this.responseText); } catch (e) {}

    if (this.status === 200 || this.status === 207) {
      var msg = (payload && payload.message) ? payload.message : 'Deployed successfully.';
      if (payload && payload.errors && payload.errors.length > 0) {
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        var hasUnauthorized = payload.errors.some(function(e) { return e.includes('401'); });
        var hint = hasUnauthorized
          ? ' — token may lack RBAC permissions. Use the ⓘ button next to the Token field to create a service account with the correct cluster role.'
          : '';
        errorDiv.innerHTML = '⚠️ Partial failure: ' + payload.errors.join('; ') + hint;
      } else {
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        successDiv.textContent = '✅ ' + msg;
      }
    } else {
      var errMsg = (payload && payload.error) ? payload.error : this.responseText;
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      errorDiv.textContent = '❌ Deploy failed: ' + errMsg;
    }
  };

  oReq.send();
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

  if (storedK8sUrl && storedToken) {
    showDemoDeployBlock();
  }

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