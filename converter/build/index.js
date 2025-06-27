"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = test;
function test(mapCode, options) {
    fetch('data.txt')
        .then(response => response.text()) // Convert response to text
        .then(data => {
        console.log(data); // Handle the file contents here
    })
        .catch(error => {
        console.error('Error fetching file:', error);
    });
    alert("HELLO");
}
