

export function test(mapCode: string, options: Record<string, any>) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.txt', true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText);  // Handle the file contents here
    }
    };
    xhr.send();

}