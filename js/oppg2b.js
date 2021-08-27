// Vertex shader program.
// Her er point-size fjernet, kun aktuell n�r man tegner punkter.

// NB! Legg merke til bruk av spesialenkeltapostrof (alt+�)
let VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	varying vec4 v_Color;
	void main() {
	  gl_Position = a_Position;
	  v_Color = a_Color;
	}`;

// Fragment shader program
// Bruker prefiks u_ for � indikere uniform
let FSHADER_SOURCE = ` 
   precision mediump float;
   varying vec4 v_Color;     
   void main() {
     gl_FragColor = v_Color;
   }`;

function main() {
    // Hent <canvas> elementet
    let canvas = document.getElementById('webgl');
    // Rendering context for WebGL, brukes til � kj�re/referere OpenGL-funksjoner/metoder og attributter:
    let gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Fikk ikke tak i rendering context for WebGL');
        return;
    }
    // Initialiser shadere:
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }
    //Initialiserer verteksbuffer:
    let noVertexes = initVertexBuffers(gl);

    //Rensker skjermen:
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tegner trekanter:
    gl.drawArrays(gl.TRIANGLES, 4, noVertexes);
    gl.drawArrays(gl.LINES, 0, 4)
}

function initVertexBuffers(gl) {
    //3 stk 2D vertekser:
    let vertices = new Float32Array([
        0.0, 0.9, 0, //line1
        0.0, -0.9, 0,
        0.9, 0.0, 0, //line2
        -0.9, 0.0, 0,
        -0.03, 0.9, 0, //triangle1
        0.03, 0.9, 0,
        0.0, 0.95, 0,
        -0.03, -0.9, 0, //triangle2
        0.03, -0.9, 0,
        0.0, -0.95, 0,
        -0.9, 0.03, 0, //triangle3
        -0.9, -0.03, 0,
        -0.95, 0.0, 0,
        0.9, 0.03, 0, //triangle4
        0.9, -0.03, 0,
        0.95, 0.0, 0,
        0.7, 0.0, 0, //big triangle1
        0.3, -0.6, 0,
        0.3, 0.6, 0,
        0.3, 0.6, 0, //big triangle2
        0.3, -0.6, 0,
        -0.85, 0.3, 0,
        0.3, 0.6, 0, //big triangle3
        0.3, -0.6, 0,
        -0.85, -0.3, 0,
        0.3, 0.6, 0, //white triangle1
        0.3, 0.3, 0,
        -0.85, 0.3, 0,
        0.3, -0.6, 0, //white triangle2
        0.3, -0.3, 0,
        -0.85, -0.3, 0

    ]);

    let noVertexes = vertices.length / 3; // Antall vertekser, hver verteks best�r av 3 floats.



    // Oppretter et bufferobjekt:
    let positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        console.log('Fikk ikke laget et bufferobjekt!?');
        return -1;
    }

    // Binder bufferobjektet:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Skriver til bufferobjektet:
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Finner posisjonen til a_Position i shaderen:
    let posAttrib = gl.getAttribLocation(gl.program, 'a_Position');
    if (posAttrib < 0) {
        console.log('Fant ikke parametret a_Position i shaderen!?');
        return -1;
    }
    // Kople verteksattributtett til bufferobjektet:
    let floatsPerVertex = 3;
    gl.vertexAttribPointer(posAttrib, floatsPerVertex, gl.FLOAT, false, 0, 0);

    // Enabler verteksshaderattributtpekeren:
    gl.enableVertexAttribArray(posAttrib);

    // Kopler fra bufferobjektet:
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let colors = new Float32Array([
        0.0, 0.7, 0.3, 1.0, //line1
        0.0, 0.7, 0.3, 1.0,
        1.0, 0.0, 0.0, 1.0, //line2
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.7, 0.3, 1.0, //triangle1
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0, //triangle2
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        1.0, 0.0, 0.0, 1.0, //triangle3
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, //triangle4
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.7, 0.9, 1.0, //big triangle1
        0.0, 0.7, 0.9, 1.0,
        0.0, 0.7, 0.9, 1.0,
        0.0, 0.7, 0.9, 1.0, //big triangle2
        0.0, 0.7, 0.9, 1.0,
        0.0, 0.7, 0.9, 1.0,
        0.0, 0.7, 0.9, 1.0, //big triangle3
        0.0, 0.7, 0.9, 1.0,
        0.0, 0.7, 0.9, 1.0,
        1.0, 1.0, 1.0, 1.0, //white triangle1
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, //white triangle2
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ]);

    let colorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Skriver til bufferobjektet:
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    let colorAttrib = gl.getAttribLocation(gl.program, 'a_Color');
    if (colorAttrib < 0) {
        console.log('colorAttrib error!');
        return -1;
    }

    let floatsPerColor = 4;
    gl.vertexAttribPointer(colorAttrib , floatsPerColor , gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorAttrib );

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return noVertexes;
}
