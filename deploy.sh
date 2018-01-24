#!/usr/bin/env bash
aws s3 cp ./index.html s3://instant-music-programs --acl "public-read" && \
aws s3 cp ./bundle.js s3://instant-music-programs --acl "public-read" && \
aws s3 cp ./other_modules s3://instant-music-programs/other_modules --acl "public-read" --recursive && \
aws s3 cp ./node_modules/monaco-editor/min/vs/editor s3://instant-music-programs/node_modules/monaco-editor/min/vs/editor --acl "public-read" --recursive && \
aws s3 cp ./node_modules/monaco-editor/min/vs/loader.js s3://instant-music-programs/node_modules/monaco-editor/min/vs/ --acl "public-read" && \
aws s3 cp ./node_modules/monaco-editor/min/vs/base/worker s3://instant-music-programs/node_modules/monaco-editor/min/vs/base/worker --acl "public-read" --recursive