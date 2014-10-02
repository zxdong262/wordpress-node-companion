# wordpress node companion

a companion app for wordpress, serve wordpress content by express(nodejs)

## important

- do not support wordpress short links '/?p=xxx'
- visit /exec/clear-cache?pass=xxxx to clear cache

## how to use

1. get it ready

```Batchfile
git clone git@github.com:zxdong262/wordpress-node-companion.git
cd wordpress-node-companion
sudo npm install
cp local-sample.js local.js
```

2. edit local.js

```javascript
module.exports = {

    //port
    port: 3333

    //wordpress home url
    ,wordpressUrl: 'http://html5beta.demo'

    //cluster servers
    ,servers: ['http://192.168.2.1:3333', 'http://192.168.2.2:3333']

    //host, http://192.168.2.1:2222, or http://html5beta.com
    ,host: 'http://127.0.0.1:3333'

    //passoword, for clearCache
    ,pass: 'stoya'
    
}
```

3. run it

```Batchfile
node app
```


## license

mit