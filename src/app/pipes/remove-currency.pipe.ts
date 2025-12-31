import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeCurrency',
    standalone: true
})
export class RemoveCurrencyPipe implements PipeTransform {
    transform(value: string | null): string {
        if (!value) return '';
        // Remove currency codes like 'USD', 'EUR', 'UAH' from the formatted string
        return value.replace(/[A-Z]{3}/g, '').trim();
    }
}
