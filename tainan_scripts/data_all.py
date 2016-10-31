# -*- coding: utf-8 -*-
import requests
import csv
import sys
from lib import csv_io

def write_csv(file_name, content):
    """write csv"""
    with open(file_name, 'w') as output_file:
        writer = csv.writer(output_file)
        writer.writerows(content)

if __name__ == '__main__':
    data = csv_io.read_csv('../data/dengue_all.csv')
    urls = ['http://data.tainan.gov.tw/dataset/3ad9da64-0c29-4299-b769-320b57a09be8/resource/7bf16e0a-2445-4ccf-a0a0-ae06a8fda4ac/download/z104104121207.csv', 'http://data.tainan.gov.tw/dataset/3ad9da64-0c29-4299-b769-320b57a09be8/resource/d4af5055-3d2c-420f-ad12-373cfae430d3/download/z104104121208.csv']

    for u in urls:
        print (urls)
        data += csv_io.req_csv(u, 'utf-8')[1:]

    #data = csv_io.read_csv('../data/dengue_all.csv')
    for item in data:
        if not item[0]:
            del item
            continue
        if len(item) < 7:
            item.insert(0, '')
        if '105' in item[1]:
            item[1] = item[1].replace('105', '2015')
        if '104' in item[1]:
            item[1] = item[1].replace('104', '2015')
        try:
            if float(item[-1]) < 50:
                tmp = item[-1] 
                item[-1] = item[-2]
                item[-2] = tmp
        except:
            pass
            
    print (data[-1])
    data = data[:-1]
    write_csv('../data/dengue_all.csv', data)
