{
  "targets": [
    {
      "target_name": "iforest",
      "sources": [
        "./cpp/addon.cpp",
        "./includes/fraud_detection_pretrained_model.h"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "./includes"
      ],
      "cflags": [
        "-fexceptions"
      ],
      "cflags_cc": [
        "-std=c++17",
        "-fexceptions"
      ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ]
    }
  ]
}
