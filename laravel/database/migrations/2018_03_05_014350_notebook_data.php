<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * 日记本数据表，也就是里面的页
 * Class NotebookData
 */
class NotebookData extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('notebook_data', function (Blueprint $table) {
            $table->increments('id');
            $table->string("title")->index();
            $table->string("content")->nullable();
            $table->integer('user_id')->index();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('notebook_data');
    }
}
