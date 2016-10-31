#!/bin/bash
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR
python3 village_class.py
python3 village_weekly.py
