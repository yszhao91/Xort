需要：
canvas
adapter = navigator.gpu.requestAdapater();
device = adapter.requestDevice();
context = canvas.getContext('webgpu');
context.configure({})

commandEncoder = device.createCommonEncoder();

textureView = context.getCurrentTexture().getView();



