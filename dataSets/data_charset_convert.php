<?php
	
	// echo $argv[2], PHP_EOL;
	$src = $argv[1];
	$dst = $argv[2];
	
	// echo (mb_detect_encoding(file_get_contents($src)));
	$tmp = mb_convert_encoding(file_get_contents($src), 'utf-8','Windows-1252');
	file_put_contents($dst,$tmp);
	// file_put_contents($dst, mb_convert_encoding($tmp, 'utf-8','Windows-1251' )); 
?>