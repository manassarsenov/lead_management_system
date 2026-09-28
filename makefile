mig:
	python3 manage.py makemigrations
	python3 manage.py migrate

createadmin:
	./manage.py createsuperuser