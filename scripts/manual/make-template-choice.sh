
echo ------------------
echo TEMPLATE CREATION
echo ------------------
scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PS3='Please enter the template to create: '
options=("web" "business" "sales" "people")
select opt in "${options[@]}"
do
    source "${scriptDir}/../template/make-template.sh" "$opt"
    break
done

