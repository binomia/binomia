# {
#     "targets": [
#         {
#             "target_name": "iforest",
#             "sources": [
#                 "./cpp/addon.cpp",
#                 "./includes/fraud_detection_rf.h" 
#             ],
#             "include_dirs": [
#                 "<!@(node -p \"require('node-addon-api').include\")",
#                 "./includes"
#             ],
#             "cflags_cc": [
#                 "-std=c++17",
#                 "-Xpreprocessor",
#                 "-fopenmp",
#                 "-frtti",
#                 "-fexceptions"         # <- add this
#             ],
#             "xcode_settings": {
#                 "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
#                 "GCC_ENABLE_CPP_RTTI": "YES",
#                 "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
#                 "MACOSX_DEPLOYMENT_TARGET": "10.15",
#                 "OTHER_CPLUSPLUSFLAGS": [
#                     "-std=c++17",
#                     "-Xpreprocessor",
#                     "-fopenmp",
#                     "-frtti"
#                 ],
#                 "OTHER_LDFLAGS": [
#                     "-framework Accelerate",
#                     "-Wl,-rpath,@loader_path"
#                 ]
#             },
#             "dependencies": [
#                 "<!(node -p \"require('node-addon-api').gyp\")"
#             ],
#             "defines": [
#                 "NAPI_CPP_EXCEPTIONS"
#             ],
#             "conditions": [
#                 ["OS=='mac'", {
#                     "xcode_settings": {
#                         "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
#                     }
#                 }]
#             ]
#         }
#     ]
# }



{
  "targets": [
    {
      "target_name": "iforest",
      "sources": [
        "./cpp/addon.cpp",
        "./includes/fraud_detection_rf.h"
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
        "-fexceptions",
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
