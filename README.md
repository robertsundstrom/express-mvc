Express MVC
=========

A small library that adds some utilities for structuring your web app according to the Model-View-Controller (MVC) pattern.

## Installation

  `npm install @robertuzzu/express-mvc`

## Usage

Using TypeScript, although it works with plain JavaScript/EcmaScript also:

controller/home.ts:
```ts
import { Controller, get, route } from "@robertuzzu/express-mvc";
import * as path from "path";

@route("/")
export default class HomeController extends Controller {

  /*
    static route = "/";
    static routes = {
       "/": [{ method: "GET", action: "index" }]
    };
  */

    constructor() {
        super();
    }

    @get("/")
    public index(params: any) {
        return this.sendFile(path.join(process.cwd(), "public/index.html"));
    }
}
```

app.ts:
```ts
import {  mvc } from "@robertuzzu/express-mvc";

import * as bodyParser from "body-parser";
import * as express from "express";
import * as http from "http";

const app = express();
app.use(bodyParser());

app.use(express.static("public"))

mvc(app);

http.createServer(app).listen(3000, () => {
    console.log("Example app listening on port 3000!");
});
```


## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.