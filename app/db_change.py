from utils.db import *


def db():
    '''basic database configuration'''
    return Connection(host='localhost', database='findtutor', user='root', password='12345')

db = db()
dbname = 'findtutor'
db.execute(
    "ALTER DATABASE `%s` CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci'" % dbname)

sql = "SELECT DISTINCT(table_name) FROM information_schema.columns WHERE table_schema = '%s'" % dbname
tables = db.query(sql)
for row in tables:
	print row
	sql = "ALTER TABLE `%s` convert to character set DEFAULT COLLATE DEFAULT" % (row['table_name'])
	db.execute(sql)
