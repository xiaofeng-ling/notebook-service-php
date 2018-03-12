<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::post('notebook/getList', 'NotebookController@getList');
Route::resource('notebook', 'NotebookController', ['except' => ['create', 'edit']]);

Route::post('notebookMain/getList', 'NotebookMainController@getList');
Route::resource('notebookMain', 'NotebookMainController', ['except' => ['create', 'edit']]);

Route::get("/test", function() {
    $test = (\App\Notebook::first())->notebookMain;
    var_dump($test);
});