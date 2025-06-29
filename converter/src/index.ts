

export function test(mapCode: string, options: Record<string, any>) {

readTextFile('D:\\Jordan\\Kirka\\KirkaMinecraftConverter-Temp\\converter\\data.txt');
  function readTextFile(file: any) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    { 
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            { 
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);

    }
}