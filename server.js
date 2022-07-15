var port = process.env.PORT || 8000;
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let gigFoundInPage = "";

app.get("/", async (req, res) => {
	res.render("index", { gigFoundInPage: gigFoundInPage });
	gigFoundInPage = "";
});

app.post("/", async (req, res) => {
	const userName = req.body.username;
	const keyword = req.body.keyword;
	var howManyPage = 20;
	const puppeteer = require("puppeteer-extra");
	const StealthPlugin = require("puppeteer-extra-plugin-stealth");
	puppeteer.use(StealthPlugin());
	const cheerio = require("cheerio");

	try {
		(async () => {
			for (var i = 1; i <= howManyPage; i++) {
				const browser = await puppeteer.launch({
					headless: true
				});
				const page = await browser.newPage();
				await page.goto(
					"https://www.fiverr.com/search/gigs?query=" + keyword + "&page=" + i
				);
				await page.waitForSelector(".seller-name");
				await page.waitForSelector("#pagination");
				const $ = cheerio.load(await page.content());
				howManyPage = $("#pagination").find(".page-number").last().text();
				let sellers = $(".seller-name").text();
				if (sellers.indexOf(userName) > -1) {
					gigFoundInPage = i;
					i = howManyPage + 1;
					await browser.close();
				} else {
                    gigFoundInPage = -1;
					await browser.close();
				}
			}
            res.redirect('/');
		})();
	} catch (e) {
        gigFoundInPage = "Somethign went wrong";
        res.redirect('/');
    }
});

app.listen(port);
