#!/bin/bash
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR
python3 get_kao_data.py
python3 dengue_each_day.py 
python3 parse_kao_data.py
