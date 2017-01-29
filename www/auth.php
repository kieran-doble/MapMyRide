<?php
header("Access-Control-Allow-Origin: *");

//Connect & Select Database
$db = mysqli_connect('mysql.hostinger.co.uk', 'u418399516_rider', '[S2OX3qIpImJI/2iy!', 'u418399516_mmr');

if (mysqli_connect_errno()) {
     die(mysqli_connect_error());
		 echo "error";
}


//Create New Account
if(isset($_POST['signup']))
{
	$fullname=$_POST['fullname'];
	$email=$_POST['email'];
	$password=$_POST['password'];
	$login = mysqli_query($db, "SELECT * FROM phonegap_login WHERE email = '$email'");
	if($login!=0)
	{
		echo "exist";
	}
	else
	{
		$newAccount=mysqli_query($db, "INSERT INTO phonegap_login (fullname`,`email`,`password`) values ('$fullname','$email','$password')");
		if($newAccount)
		{
			echo "success";
		}
		else
		{
			echo "failed";
		}
	}
	echo mysql_error();
}

//Login
if(isset($_POST['login']))
{
	$email=$_POST['email'];
	$password=$_POST['password'];
	$login=mysqli_query("select * from `phonegap_login` where `email`='$email' and `password`='$password'");
	if($login!=0)
	{
		echo "success";
	}
	else
	{
		echo "failed";
	}
}

//Change Password
if(isset($_POST['change_password']))
{
	$email=$_POST['email'];
	$old_password=$_POST['old_password'];
	$new_password=$_POST['new_password'];
	$check=mysql_query("select * from `phonegap_login` where `email`='$email' and `password`='$old_password'");
	if($check!=0)
	{
		mysql_query("update `phonegap_login` set `password`='$new_password' where `email`='$email'");
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
	$q=mysqli_query("select * from `phonegap_login` where `email`='$email'");
	$check=mysql_num_rows($q);
	if($check!=0)
	{
		echo "success";
		$data=mysql_fetch_array($q);
		$string="Hey,".$data['fullname'].", Your password is".$data['password'];
		mail($email, "Your Password", $string);
	}
	else
	{
		echo "invalid";
	}
}

?>
