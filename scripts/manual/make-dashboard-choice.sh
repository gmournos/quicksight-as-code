
echo ------------------
echo DASHBOARD CREATION
echo ------------------
scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PS3='Please enter the dashboard to create: '
options=("web" "business" "sales" "people")

select opt in "${options[@]}"
do
	source ../dashboard/make-dashboard.sh "$opt"
	break
done