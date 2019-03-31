# KubeInvaders
### Chaos Engineering Tool for Kubernetes and Openshift

KubeInvaders is a game and it has been written with Defold (https://www.defold.com/).

Through KubeInvaders you can stress your Openshift cluster in a fun way and check how it is resilient.

**Actually this is an alpha release and it has been tested only with Openshift 3.9**

### How KubeInvaders Works

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/kubeinvaders.gif)

### Donwload KubeInvaders

Please check the [releases](https://github.com/lucky-sideburn/KubeInvaders/releases) page.


### How Configure KubeInvaders

.KubeInv.conf looks like this:

```
cat ./.KubeInv.conf

token fh9349hr943r943fsdoffhosfos

endpoint https://ocmaster39:8443

namespace foobar
```
**the token should have permission for list and delete pods into the namespace**

Where should be .KubeInv.conf?

Start the game and it will say to you where

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/conf.png)

