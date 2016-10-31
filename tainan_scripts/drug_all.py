#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import csv
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
import json
from lib import csv_io
from lib import json_io


if __name__ == '__main__':
    m8 = 'http://data.tainan.gov.tw/dataset/4c260d97-e268-4b4a-8b15-c0fc92a25120/resource/316034ad-f2ae-4a8e-bafd-d6d98e388aaa/download/10408.csv'
    m9 = 'http://data.tainan.gov.tw/dataset/4c260d97-e268-4b4a-8b15-c0fc92a25120/resource/2cdd3bbe-6a8c-438e-b85a-1bde14382944/download/10409.csv'
    m10 = 'http://data.tainan.gov.tw/dataset/4c260d97-e268-4b4a-8b15-c0fc92a25120/resource/fde0f38c-ba91-40e1-a69b-406f061c1a3b/download/10410.csv'
    m11 = 'http://data.tainan.gov.tw/dataset/4c260d97-e268-4b4a-8b15-c0fc92a25120/resource/ede84d86-ffdf-4233-aaa1-b31b329fcaec/download/z10410410411.csv'

    m8 = csv_io.req_csv(m8, 'utf-8')
    m9 = csv_io.req_csv(m9, 'utf-8')
    m10 = csv_io.req_csv(m10, 'utf-8')
    m11 = csv_io.req_csv(m11, 'utf-8')
    print (m9[0])
    print (m10[0])
    for row in m10:
        row.insert(8, row[-2])
        row.insert(9, row[-3])
        del row[-2]
        del row[-2]

    for row in m11:
        row.insert(8, row[-2])
        row.insert(9, row[-3])
        del row[-2]
        del row[-2]
 
    
    data = m8 + m9[1:] + m10[1:] + m11[1:]
    print (m10[0])
    print (data[-1])
    csv_io.write_csv('../data/drug_all.csv', data)
