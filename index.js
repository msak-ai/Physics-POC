import fetch from 'node-fetch';
import csvtojson from "csvtojson";
import * as fs from 'fs';
import cors from 'cors'
import express from 'express';
let input = "all";
// ip = 104.20.50.185;
// const url = `http://104.20.50.185/relnsd/v1/data?fields=ground_states&nuclides=${input}`;
const  url = `https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all`
// const url = `http://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=${input}`;
const app = express();
const PORT = process.env.PORT || 4444;

app.use(cors({
    origin: "*"
}))

app.get('/data', async (req, res, next) => {
    const Z = req.query.z;
    const N = req.query.n;
    console.log(req.query)
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.text();
            // res.send(data);
            // res.header("Access-Control-Allow-Origin", "*");
            fs.writeFile('output.csv', data, async (err) => {
                if (err) throw err;
                try {
                    const csv = new csvtojson();
                    const json = await csv.fromFile('output.csv');
                    const stable_nuclei = json.find((x) => (x.z === Z && x.n === N));
                    if (stable_nuclei) {
                        await res.send(stable_nuclei);
                    }
                    else {

                        res.send({
                            "msg": "Sorry, but this Isotope is nonexistent!"
                        })
                    }

                    // use filter function
                } catch (err) {
                    console.log(err);
                }
            })
        }
    } catch (error) { console.log(error) }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));