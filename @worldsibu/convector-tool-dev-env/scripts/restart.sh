#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..

$ROOT_DIR/scripts/stop.sh
$ROOT_DIR/scripts/clean.sh
$ROOT_DIR/scripts/start.sh
$ROOT_DIR/scripts/init.sh
