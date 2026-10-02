import express, { type Express, type Response, type Request, request } from "express";

const app: Express = express();
const PORT: number = 8080;

// app.get('/', (req: Request, res: Response) => {
//     console.log("request on ", "/")
//     res.send('Hello World!');
// });

app.use("/app", express.static("./src/app"));

// app.use(express.static('.'));
app.get('/healthz', (request, response) => {

    response.set({"Content-Type": "text/plain; charset=utf-8"});
    response.send('OK');
});

app.listen(PORT, () => {
    console.log(`Starting server, listening on port ${PORT}`);
});