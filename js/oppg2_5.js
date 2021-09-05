'use strict';

// Vertex shader program
let VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '}\n';

// Fragment shader program
let FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 	// bruker prefiks u_ for å indikere uniform
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
    '}\n';

// Andre globale variabler:
let gl = null;
let canvas = null;
let positionBuffer = null;
// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let projectionMatrix = null;

function main() {
    init();

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    // Initialiserer verteksbuffer:
    initBuffers();

    // Binder shaderparametre:
    if (!initUniforms())
        return;

    draw();
}

function init() {
    // Hent <canvas> elementet
    canvas = document.getElementById('webgl');

    // Rendering context for WebGL:
    gl = canvas.getContext('webgl');
    if (!gl)
        console.log('Fikk ikke tak i rendering context for WebGL');

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Setter bakgrunnsfarge:
    gl.clearColor(0.0, 0.30, 0.1, 1.0); //RGBA
}

function initBuffers() {
    // 3D vertekser:
    let trianglePositions = new Float32Array([   //NB! ClockWise!!
        1.0, 1.0, 1.0, //Front Face
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, -1.0, //Right Face
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, //Top Face
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0, //Left Face
        -1.0, 1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, -1.0, //Back Face
        1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0, //Bottom Face
        -1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
    ]);

    // Verteksbuffer:
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);

    positionBuffer.itemSize = 3; // NB!!
    positionBuffer.numberOfItems = trianglePositions.length / 3; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initUniforms() {
    // Farge: u_FragColor (bruker samme farge på alle piksler/fragmenter):
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
        return false;
    }
    let rgba = [0.8, 0.5, 0.0, 1.0];
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
    return true;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // BackfaceCulling:
    gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
    gl.enable(gl.CULL_FACE);	//enabler culling.
    gl.cullFace(gl.BACK);		//culler baksider.

    // Binder først til aktuelt buffer:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Kopler til shaderattributter:
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    modelMatrix.scale(2, 4, 1);
    modelMatrix.translate(3, 0, 0);

    let eyeX = 4, eyeY = 5, eyeZ = 50;
    let lookX = 0, lookY = 10, lookZ = 0;
    let upX = 0, upY = 1, upZ = 0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);

    drawBox(-5.0, 0.0, 0.0, 1.0, 1.0, 1.0);
    drawBox(2.5, 2.5, 0.0, 4.0, 1.5, 1.0);
    drawBox(0.0, 1.0, 0.0, 0.3, 0.3, 0.5);
    drawBox(0.0, 2.0, 0.0, 1.5, 1.5, 1.5);
    drawBox(3.0, -2.0, 0.0, 1.5, 0.5, 0.5);
    drawBox(-4.0, 0.0, 0.0, 1.0, 1.0, 1.0);
    drawBox(2.0, -13.5, 0.0, 40.0, 0.0, 100.0);
}

function drawBox(x, y, z, sx, sy, sz) {
    modelMatrix.setTranslate(x, y, z);
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    modelMatrix.setScale(sx, sy, sz);
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);
}
