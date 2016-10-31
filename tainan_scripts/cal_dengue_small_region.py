from lib import csv_io
from lib import json_io

dengue = csv_io.read_csv('../data/dengue_small_region.csv')
population = csv_io.read_csv('../data/population.csv')

data = {}
elderData = {}
header = dengue[0]
dengue = dengue[1:]
for case in dengue:
    if case[-3] not in data:
        data[case[-3]] = 0
        elderData[case[-3]] = 0
    data[case[-3]] += 1
    if case[2][0] == '6' or case[2][0] == '7':
        elderData[case[-3]] += 1

header = [population[1][4]] + ['病例人數', '長者人數', '總百分比', '長者百分比'] 
population = population[2:]
new_data = {}
max_t = 0
max_e = 0
for region in population:
    code = region[2]
    people = region[4]
    region = [region[4]]
    if code in data:
        total = data[code]
        elder = elderData[code]
        region.append(total)
        region.append(elder)
        max_tr = round(float(total)/float(people) * 100, 3)
        region.append(max_tr)
        max_er = round(float(elder)/float(people) * 100, 3)
        region.append(max_er)
        if max_tr > max_t and int(people) > 20:
            max_t = max_tr

        if max_er > max_e and int(people) > 20:
            max_e = max_er
    else:
        region.append(0)
        region.append(0)
        region.append(0)
        region.append(0)

    new_data[code] = {}
    for i in range(0, len(header)):
        new_data[code][header[i]] = region[i]

new_data['max_e'] = max_e
new_data['max_t'] = max_t
print (max_e, max_t)
#csv_io.write_csv('../data/small_region_dengue_pop.csv', population)
json_io.write_json('../data/small_region_dengue_pop.json', new_data)
