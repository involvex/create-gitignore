#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.ensureLogPattern = ensureLogPattern;

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var args = (0, _minimist2.default)(process.argv.slice(2));

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getGitignore(name, cb) {
  (0, _axios2.default)(
    "https://raw.githubusercontent.com/github/gitignore/master/" +
      capitalize(name) +
      ".gitignore",
  )
    .then(function (body) {
      cb(null, body.data);
    })
    .catch(function (err) {
      if (err.response.status === 404) {
        (0, _axios2.default)(
          "https://raw.githubusercontent.com/github/gitignore/master/Global/" +
            capitalize(name) +
            ".gitignore",
        )
          .then(function (body) {
            cb(null, body.data);
          })
          .catch(function (err) {
            cb(404, null);
          });
      }
    });
}

function ensureLogPattern(gitignore) {
  if (!gitignore.includes("*.log")) {
    gitignore += "\n\n# Logs\n*.log\n";
  }
  return gitignore;
}

function createFile(gitignore) {
  gitignore = ensureLogPattern(gitignore);

  _fs2.default.stat(".gitignore", function (err, file) {
    if (!file) {
      _fs2.default.writeFile(
        ".gitignore",
        gitignore,
        { encoding: "utf-8" },
        function () {
          console.log(_chalk2.default.green("\nFile created!"));
        },
      );
    } else {
      _inquirer2.default
        .prompt([
          {
            type: "confirm",
            message: "Overwrite existing .gitignore file?",
            name: "overwrite",
          },
        ])
        .then(function (answer) {
          if (answer.overwrite) {
            _fs2.default.writeFile(
              ".gitignore",
              gitignore,
              { encoding: "utf-8" },
              function () {
                console.log(_chalk2.default.green("\nFile created!"));
              },
            );
          } else {
            console.log("\nOk, bye!");
          }
        });
    }
  });
}

if (require.main === module) {
  if (args._[0] && args._[0] !== "list") {
    console.log(
      _chalk2.default.green("Trying to create .gitignore for"),
      _chalk2.default.green.bold(capitalize(args._[0])),
    );
    getGitignore(args._[0], function (err, file) {
      if (err === 404)
        console.log(
          _chalk2.default.red("Template not found. Use: create-gitignore list"),
        );
      else createFile(file);
    });
  } else if (!args._[0]) {
    console.error("Usage:", "create-gitignore <template>");
  }

  if (args._[0] == "list") {
    console.log(_chalk2.default.cyan("Fetching template list.. \n"));
    var list = [];
    (0, _axios2.default)(
      "https://api.github.com/repos/github/gitignore/contents/",
    ).then(function (body) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (
          var _iterator = body.data[Symbol.iterator](), _step;
          !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
          _iteratorNormalCompletion = true
        ) {
          var file = _step.value;

          if (
            file.name.split(".")[0] !== "README" &&
            file.name.split(".")[0] !== "CONTRIBUTING" &&
            file.name.split(".")[0] !== "LICENSE"
          )
            list.push(file.name.split(".")[0]);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      (0, _axios2.default)(
        "https://api.github.com/repos/github/gitignore/contents/Global",
      ).then(function (body) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (
            var _iterator2 = body.data[Symbol.iterator](), _step2;
            !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
            _iteratorNormalCompletion2 = true
          ) {
            var file = _step2.value;

            if (
              file.name.split(".")[0] !== "README" &&
              file.name.split(".")[0] !== "CONTRIBUTING" &&
              file.name.split(".")[0] !== "LICENSE"
            )
              list.push(file.name.split(".")[0]);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        console.log(
          _chalk2.default.cyan("Available templates:"),
          list.slice(1).join(", "),
        );
      });
    });
  }
}
