

export function test(mapCode: string, options: Record<string, any>) {

    fetch('data.txt')
    .then(response => response.text())  // Convert response to text
    .then(data => {
        console.log(data);  // Handle the file contents here
    })
    .catch(error => {
        console.error('Error fetching file:', error);
    });

}