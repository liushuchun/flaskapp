#------*-coding:utf-8-*---------
from flask import render_template, flash, redirect, request, abort, send_from_directory
from app import app
from flask import Flask, jsonify, make_response
from models import Model
from flask.ext.httpauth import HTTPBasicAuth
import os
from utils.staticvalues import *

auth = HTTPBasicAuth()
model = Model()


@auth.verify_password
def verify_password(username, password):
    return model.verify_user(username, password)


@auth.error_handler
def unauthorized():
    # return 403 instead of 401 to prevent browsers from displaying the default
    # auth dialog
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)


@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'error': 'Not Found'}), 400)


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not Found'}), 400)


#------data format
user = [{
    "status": {
        "code": 10000,
        "message": "Success"
    },
    "data": {

    }

}]


check_result = lambda result: jsonify(success_return) if result else jsonify(failed_return)


@app.route('/api/v1.0/register/', methods=['GET', 'POST'])
def register():
    if not request.json or not 'name' in request.json or not 'password' in request.json:
        abort(400)
    if not 'email' in request.json:
        abort(400)

    user = {
        'name': request.json['name'],
        'email': request.json['email'],
        'password': request.json['password'],
        'sex': request.json['sex']
    }
    if 'latitude' in request.json:
        user['latitude'] = request.json['latitude']
    if 'longtitude' in request.json:
        user['longitude'] = request.json['longtitude']
    #/model
    result = model.add_user(user)
    if result:
        return jsonify(success_return)
    else:
        return jsonify(failed_return)


@app.route('/api/v1.0/editprofile/', methods=['GET', 'POST'])
@auth.login_required
def edit_user():
    if not request.json:
        abort(400)
    for key in check_edit_user:
        if key not in request.json:
            return abort(400)

    user = {}
    for key in check_edit_user:
        user[key] = request.json[key]

    result = model.edit_user_profile(user)

    return check_result(result)


@app.route('/api/v1.0/addskillitem/', methods=['GET', 'POST'])
def add_skill_item():
    if not request.json or not 'skill_name' in request.json or not 'skill_intro' in request.json:
        abort(400)
    result = model.add_skill_item(
        name=request.json['skill_name'], intro=request.json['skill_intro'])
    return check_result(result)


@app.route('/api/v1.0/editskills/', methods=['GET', 'POST'])
def edit_skills():
    if not request.json:
        abort(400)
    for key in check_edit_skills:
        if key not in request.json:
            abort(400)
    
    print request.json
    result = model.update_user_skill(user_id=request.json[
                                     'user_id'], skill_list=request.json["skill_ids"], types=request.json["type"])
    return jsonify(success_return) if result else jsonify(failed_return)


@app.route('/api/v1.0/editphoto/', methods=['GET', 'POST'])
def edit_photo():
    if not request.json or not 'photo_id' in request.json or not 'user_id' in request.json:
        abort(400)
    user["id"] = request.json["user_id"]
    user["photo_id"] = request.json["photo_id"]
    reuslt = model.edit_user(user)
    if result:
        return jsonify(success_return)
    else:
        return jsonify(failed_return)


@app.route('/api/v1.0/userdetail/', methods=['GET', 'POST'])
def user_detail():
    if not request.json or not 'user_id' in request.json:
        abort(400)

    '''user = {
        "id": 1,
        'photo_id': 1,
        'sign': '吉他之神',
        'name': '树春',
        'sex': '1',
        'introduction': '',
        'longtitude': 123.1,
        'latitude': 43.1,
        'good_at': [
            {
                "skill_id": 12,
                "skill_name": '吉他',
                "level": '初级'
            },
            {
                "skill_id": 13,
                "skill_name": '计算机',
                "level": '高级'
            }
        ],
        'expect': [
            {
                "skill_id": 14,
                "skill_name": '侃大山',
            },
            {
                "skill_id": 15,
                "skill_name": '挖掘机',
            }
        ]

    }'''
    user_id = request.json["user_id"]
    user = model.get_user_info(user_id)
    return jsonify({"status": status_success, "data": user})


@app.route('/api/v1.0/productdetail/', methods=['GET', 'POST'])
def product_detail():
    print request.data
    if not request.json or not 'product_id' in request.json:
        abort(400)
    data = model.get_product_info(request.json["product_id"])
    return jsonify({"status": status_success, "data": data})


@app.route('/api/v1.0/recommend/',methods=['GET','POST'])
def recommend():
    if not request.json or not 'user_id' in request.json:
        abort(400)
    data=model.get_recommend(request.json["user_id"])
    return jsonify({"status":status_success,"data":data})
    


@app.route('/api/v1.0/addProduct/', methods=['GET', 'POST'])
def add_product():
    '''

    '''
    if not request.json or not 'user_id' in request.json \
            or not 'address' in request.json or not 'skill_id' in request.json \
            or not 'descrption' in request.json or not 'latitude' in request.json \
            or not 'longitude' in request.json or not 'title' in request.json:
        abort(400)
    params = ['user_id', 'address', 'skill_id',
              'descrption', 'latitude', 'longtitude', 'title']
    product = {}
    for param in params:
        product[param] = request.json[param]

    model.add_product(product)


@app.route('/api/v1.0/productList/', methods=['GET', 'POST'])
def get_products():
    print 'test'
    if not request.json or not 'user_id' in request.json \
            or not 'key_word' in request.json or not 'type' in request.json:
        abort(400)
    data_list = model.get_product_list(key=request.json["key_word"],
                                       user_id=request.json["user_id"], order_type=request.json["type"])
    print data_list
    return jsonify({"status": status_success, "data": data_list})

# will return the name's pasword if equal pass else None


@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 401)
