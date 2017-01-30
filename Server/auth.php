<?php

header("Access-Control-Allow-Origin: *");

//Connect & Select Database
$db = mysqli_connect('mysql.hostinger.co.uk', 'u418399516_rider', '[S2OX3qIpImJI/2iy!', 'u418399516_mmr');

if (mysqli_connect_errno()) {
     die(mysqli_connect_error());
}


//Create New Account
if(isset($_POST['signup']))
{
	$fullname=mysqli_real_escape_string($db, $_POST['fullname']);
	$email=mysqli_real_escape_string($db, $_POST['email']);
	$password=mysqli_real_escape_string($db, $_POST['password']);
	$login = mysqli_query($db, "SELECT * FROM phonegap_login WHERE email = '$email'");
	if (mysqli_num_rows($login))
	{
		echo "Account exists";
	} else
	{
		// account does not exist
		$newAccount=mysqli_query($db, "INSERT INTO phonegap_login (`fullname`, `email`, `password`)
			values ('$fullname',`$email`, SHA2('$password'))");
		if (mysqli_num_rows($newAccount))
		{
			echo "success";
		}
		else
		{
			echo "failed";
		}
	}
}

//Login
if(isset($_POST['login']))
{
	$email=mysqli_real_escape_string($db, $_POST['email']);
	$password=mysqli_real_escape_string($db, $_POST['password']);
	$login=mysqli_query($db, "select * from phonegap_login where `email`='{$email}' and `password`='{$password}'");

	if (mysqli_num_rows($login)) {
	    echo "success";
	} else {
	    echo "failed";
	}
}

//Change Password
if(isset($_POST['change_password']))
{
	$email=$_POST['email'];
	$old_password=mysqli_real_escape_string($_POST['old_password']);
	$new_password=mysqli_real_escape_string($_POST['new_password']);
	$check=mysqli_query($db, "select * from 'phonegap_login' where 'email'='$email' and `password`='$old_password'");
	if(mysqli_num_rows($check))
	{
		mysqli_query($db, "update 'phonegap_login' set `password`='$new_password' where 'email'='$email'");
		echo "success";
	}
	else
	{
		echo "incorrect";
	}
}

// Forget Password
if(isset($_POST['forget_password']))
{
	$email=$_POST['email'];
	$q=mysqli_query($db, "select * from 'phonegap_login' where 'email'='$email'");
	if(mysqli_num_rows($q))
	{
		echo "success";
		$data = mysqli_fetch_array($q,MYSQLI_ASSOC);
		$string="Hey,".$data['fullname'].", Your password is".$data['password'];
		mail($email, "Your Password", $string);
	}
	else
	{
		echo "invalid";
	}
}

?>
