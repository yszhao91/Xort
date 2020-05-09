class DirectBuffer {
  constructor(renderer) {
    this.gl = renderer.gl;
    this.positions = [];
    this.normals = [];
    this.texcoords = [];
    this.indices = [];
  }

  createVertexArray(gl, programInfos, bufferInfo) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    if (!programInfos.length)
    {
      programInfos = [programInfos];
    }
    programInfos.forEach(function (programInfo) {
      programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    });
    gl.bindVertexArray(null);
    return {
      numElements: bufferInfo.numElements,
      elementType: bufferInfo.elementType,
      vertexArrayObject: vao,
    };
  }

  createVAOAndSetAttributes(gl, setters, attribs, indices) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    programs.setAttributes(setters, attribs);
    if (indices)
    {
      gl.bindBuffer(ELEMENT_ARRAY_BUFFER, indices);
    }
    // We unbind this because otherwise any change to ELEMENT_ARRAY_BUFFER
    // like when creating buffers for other stuff will mess up this VAO's binding
    gl.bindVertexArray(null);
    return vao;
  }

  createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
    return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
  }
}

