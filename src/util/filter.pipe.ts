import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})

export class FilterPipe implements PipeTransform {

    //Define a filter pipe that transform an array according to a searchText
    transform(items: any[], searchText: string): any[] {
        //Check if the array is initialized
        if(!items) return
        //Check if search text is initialized or only whitespaces
        if(!searchText || !searchText.trim())  return items;

        //Convert to lower case
        searchText = searchText.toLowerCase();

        //Filter the array returning only items which address (in lower case) includes searchText
        return items.filter( it => {
            return it.address.toLowerCase().includes(searchText);   
        });

    }
}