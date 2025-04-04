import csv
import random
import string

# Fixed teacher_id from the existing file
teacher_id = '308b5e3e-893d-40b9-85f4-957baa1a3533'

# Chinese surnames and given name characters (simplified list)
surnames = ['王', '李', '張', '劉', '陳', '楊', '黃', '趙', '吳', '周', '徐', '孫', '馬', '朱', '胡']
given_name_chars = ['明', '華', '英', '志', '建', '國', '文', '玉', '芳', '麗', '娜', '秀', '偉', '傑', '強']

# Open file for writing
with open('/Users/weishian/Downloads/student_rows.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    
    # Write header
    writer.writerow(['name', 'ig', 'teacher_id'])
    
    # Generate and write 500 student records
    for _ in range(500):
        # Generate name
        name = random.choice(surnames) + ''.join(random.choices(given_name_chars, k=random.randint(1, 2)))
        
        # Generate IG handle
        if random.random() < 0.3:  # 30% chance of having no IG
            ig = '--'
        else:
            ig = '@' + ''.join(random.choices(string.ascii_lowercase, k=random.randint(3, 8)))
            if random.random() < 0.5:  # 50% chance of having numbers in handle
                ig += '.' + ''.join(random.choices(string.digits, k=random.randint(2, 4)))
        
        # Write the record
        writer.writerow([name, ig, teacher_id])

print('Generated 500 student records in /Users/weishian/Downloads/student_rows.csv') 