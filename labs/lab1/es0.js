"use strict";

let printFirstAndLastTwoChars = strings => strings.map((s) => {
    if (s.length < 2) {
        console.log("");
        return "";
    } else {
        let newStr = s.slice(0, 2) + s.slice(s.length - 2);
        console.log(newStr);
        return newStr;
    }
});

const testStrings = ["it", "cat", "spring", "testing", "hello world"];
const expectedStrings = ["itit", "caat", "spng", "teng", "held"];
const gotStrings = printFirstAndLastTwoChars(testStrings);
for (let i = 0; i < expectedStrings.length; i++) {
    console.assert(gotStrings[i] === expectedStrings[i], "The function is not working as expected");
}
