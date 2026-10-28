import express, { type Express, type Response, type Request, request, NextFunction, response } from "express";
import { config } from "./config.js";
import {z} from "zod";

class BadRequest extends Error 
{
    constructor(message: string) {
        super(message);
    }
}

function removeProfane(body: string) : string
{
    let profane = ["kerfuffle", "sharbert", "fornax"];
    
    let bodyArr = body.split(' ');

    for (let i = 0; i < bodyArr.length; i++) {
        if (profane.includes(bodyArr[i].toLowerCase())) {
            bodyArr[i] = "****";
        }  
    }

    return bodyArr.join(' ');
}

function middlewareMetricInc(req: Request, res: Response, next: NextFunction) : void
{
    config.fileServerHits++;
    next();
}

function middlewareLogResponse(req: Request, res: Response, next: NextFunction) : void 
{
    res.on("finish", () => {

        const responseStatus = res.statusCode;

        if (responseStatus === 404) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${responseStatus}`)
        }
    });

    next();
};

function middlewareHandleError(err: Error, req: Request, res: Response, next: NextFunction)
{
    if (err instanceof BadRequest) {
        res.status(400).json({ error: err.message });
    } else {
        res.status(500).json({ error: "Something went wrong on our end" });
    }
}

// Router for API 
const apiRouter = express.Router();

apiRouter.get('/healthz', (request, response) => {

    response.set({"Content-Type": "text/plain; charset=utf-8"});
    response.send('OK');
});

const ChirpSchema = z.object({"body": z.string()});
type ResponseBody = {"error": string } | {"cleanedBody": string }

async function validate_chirp(request: Request, response: Response) {
    let responseBody: ResponseBody = {"error": "Something went wrong"};
    let status = 400;

    const validatedChrip = ChirpSchema.safeParse(request.body);

    if (validatedChrip.success) {
        const body = validatedChrip.data.body;

        if (body.length > 140) {
            throw new BadRequest("Chirp is too long. Max length is 140")
        } else {
            const cleanedBody = removeProfane(body);
            responseBody = {"cleanedBody": cleanedBody};
            status = 200;
        }
    }

    response.status(status).send(responseBody);
}

apiRouter.post('/validate_chirp', async (request, response) => {
    await validate_chirp(request, response);
});


// Router for admin API
const adminRouter = express.Router();

adminRouter.get('/metrics', (request, response) => {
    response.set({"Content-Type": "text/html; charset=utf-8"})
    response.send(`<html>
                       <body>
                           <h1>Welcome, Chirpy Admin</h1>
                           <p>Chirpy has been visited ${config.fileServerHits} times!</p>
                       </body>
                   </html>`
    );
});

adminRouter.post('/reset', (request, response) => {

    config.fileServerHits = 0;
    response.send("Reset complete");
});


const app: Express = express();
const PORT: number = 8080;

// Root
app.use(express.json());
app.use("/", middlewareLogResponse);


// Application static html, CSS and JS
app.use("/app", middlewareMetricInc, express.static("./src/app"));

// Routers
app.use("/admin", adminRouter)
app.use("/api", apiRouter);

app.use(middlewareHandleError);

app.listen(PORT, () => {
    console.log(`Starting server, listening on port ${PORT}`);
});