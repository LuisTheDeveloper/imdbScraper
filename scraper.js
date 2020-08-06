const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { response } = require("express");

const searchUrl = "https://www.imdb.com/find?s=tt&type=ft&ref_=fn_ft&q=";
const movieUrl = "https://www.imdb.com/title/";

const searchCache = {};
const movieCache = {};

function searchMovies(searchTerm) {
  if (searchCache[searchTerm]) {
    console.log("Serving from cache: ", searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

  return fetch(`${searchUrl}${searchTerm}`)
    .then((response) => response.text())
    .then((body) => {
      const movies = [];
      const $ = cheerio.load(body);
      $(".findResult").each(function (i, element) {
        const $element = $(element);
        const $image = $element.find("td a img");
        const $title = $element.find("td.result_text a");

        const imdbID = $title.attr("href").match(/title\/(.*)\//)[1];

        const movie = {
          image: $image.attr("src"),
          title: $title.text(),
          imdbID,
        };
        movies.push(movie);
      });

      searchCache[searchTerm] = movies;

      return movies;
    });
}

const getMovie = (imdbID) => {
  if (movieCache[imdbID]) {
    console.log("Serving from cache: ", imdbID);
    return Promise.resolve(movieCache[imdbID]);
  }

  return fetch(`${movieUrl}${imdbID}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);

      // Get title
      const $title = $(".title_wrapper h1");

      const title = $title
        .first()
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();

      // Get rating, duration and genres
      const $context = $("div.subtext").text().replace(/\s/g, "");
      const allMovieInfo = $context.split("|");
      const rating = allMovieInfo[0];
      const duration = allMovieInfo[1];
      const genres = allMovieInfo[2].split(",");

      // Get Date Published
      let tempData = allMovieInfo[3].split("(");
      const datePublished = tempData[0];

      // Get imdbRating
      const imdbRating = $('span[itemProp="ratingValue"]').text();

      // Get movie poster
      const poster = $("div.poster a img").attr("src");

      // Get movie summary
      const summary = $("div.summary_text").text().trim();

      // Get directors
      tempData = $("div.credit_summary_item").text().trim();
      tempData = tempData.replace(/\s/g, "");
      const credits = tempData.split(":");
      tempData = credits[1];
      const directors = tempData.substring(0, tempData.length - 6);

      // Get storyline
      tempData = $("#titleStoryLine div.inline.canwrap span").text().trim();
      let tempArray = tempData.split(".");
      let tempArray2 = tempArray.splice(tempArray.length - 1, 1);
      tempData = "";
      tempArray.map(
        (x) =>
          (tempData = tempData.length > 0 ? tempData + ". " + x : tempData + x)
      );
      const storyLine = tempData;

      const movie = {
        title,
        rating,
        duration,
        genres,
        datePublished,
        imdbRating,
        poster,
        summary,
        directors,
        storyLine,
      };

      movieCache[imdbID] = movie;

      return movie;
    });
};

module.exports = {
  searchMovies,
  getMovie,
};
