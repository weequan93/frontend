import { Flex, Text } from '@chakra-ui/react';
import { isEqual } from 'es-toolkit';
import type { ChangeEvent } from 'react';
import React from 'react';

import { ADVANCED_FILTER_AGES, type AdvancedFilterAge, type AdvancedFilterParams } from 'types/api/advancedFilter';

import dayjs from 'lib/date/dayjs';
import { Input } from 'toolkit/chakra/input';
import { PopoverCloseTriggerWrapper } from 'toolkit/chakra/popover';
import { ndash } from 'toolkit/utils/htmlEntities';
import TableColumnFilter from 'ui/shared/filters/TableColumnFilter';
import TagGroupSelect from 'ui/shared/tagGroupSelect/TagGroupSelect';

import { getDurationFromAge } from '../lib';

const FILTER_PARAM_FROM = 'age_from';
const FILTER_PARAM_TO = 'age_to';
const FILTER_PARAM_AGE = 'age';

const MAX_DAYS = 31;

const defaultValue = { age: '', from: '', to: '' } as const;
type AgeFromToValue = { age: AdvancedFilterAge | ''; from: string; to: string };

type Props = {
  value?: AgeFromToValue;
  handleFilterChange: (filed: keyof AdvancedFilterParams, value?: string) => void;
  columnName: string;
  isLoading?: boolean;
  onClose?: () => void;
};

const DateInput = ({ value, onChange, placeholder, max }: { value: string; onChange: (value: string) => void; placeholder: string; max: string }) => {
  const [ tempValue, setTempValue ] = React.useState(value ? dayjs(value).format('YYYY-MM-DD') : '');

  React.useEffect(() => {
    // reset
    if (!value) {
      setTempValue('');
    }
  }, [ value ]);

  const handleChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTempValue(event.target.value);
    onChange(event.target.value);
  }, [ onChange ]);

  return (
    <Input
      value={ tempValue }
      onChange={ handleChange }
      placeholder={ placeholder }
      type="date"
      max={ max }
      autoComplete="off"
      size="sm"
    />
  );
};

const AgeFilter = ({ value = defaultValue, handleFilterChange, onClose }: Props) => {
  const [ currentValue, setCurrentValue ] = React.useState<AgeFromToValue>({
    age: value.age || '',
    from: value.age ? '' : (value.from || ''),
    to: value.age ? '' : (value.to || ''),
  });

  const clampToMaxDays = (from: string, to: string) => {
    if (!from || !to) return { from, to };
    const fromDate = dayjs(from).startOf('day');
    let toDate = dayjs(to).endOf('day');
    if (toDate.diff(fromDate, 'day') > MAX_DAYS) {
      toDate = fromDate.add(MAX_DAYS, 'day').endOf('day');
    }
    return { from: fromDate.toISOString(), to: toDate.toISOString() };
  };

  const handleFromChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(prev => {
      const newFrom = event.target.value;
      let newTo = prev.to;
      if (newTo) {
        const fromDate = dayjs(newFrom);
        const toDate = dayjs(newTo);
        if (toDate.diff(fromDate, 'day') > MAX_DAYS) {
          newTo = fromDate.add(MAX_DAYS, 'day').format('YYYY-MM-DD');
        }
      }
      return { age: '', to: newTo, from: newFrom };
    });
  }, []);

  const handleToChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(prev => {
      const newTo = event.target.value;
      let newFrom = prev.from;
      if (newFrom) {
        const fromDate = dayjs(newFrom);
        const toDate = dayjs(newTo);
        if (toDate.diff(fromDate, 'day') > MAX_DAYS) {
          newFrom = toDate.subtract(MAX_DAYS, 'day').format('YYYY-MM-DD');
        }
      }
      return { age: '', from: newFrom, to: newTo };
    });
  }, []);

  const onPresetChange = React.useCallback((age: AdvancedFilterAge) => {
    const from = dayjs((dayjs().valueOf() - getDurationFromAge(age))).toISOString();
    handleFilterChange(FILTER_PARAM_FROM, from);
    const to = dayjs().toISOString();
    handleFilterChange(FILTER_PARAM_TO, to);
    handleFilterChange(FILTER_PARAM_AGE, age);
    onClose?.();
  }, [ handleFilterChange, onClose ]);

  const onReset = React.useCallback(() => setCurrentValue(defaultValue), []);

  const onFilter = React.useCallback(() => {
    if (!currentValue.age && !currentValue.to && !currentValue.from) {
      handleFilterChange(FILTER_PARAM_FROM, undefined);
      handleFilterChange(FILTER_PARAM_TO, undefined);
      handleFilterChange(FILTER_PARAM_AGE, undefined);
      return;
    }
    let from: string;
    let to: string;
    if (currentValue.age) {
      from = dayjs((dayjs().valueOf() - getDurationFromAge(currentValue.age))).toISOString();
      to = dayjs().toISOString();
    } else {
      const clamped = clampToMaxDays(currentValue.from, currentValue.to);
      from = clamped.from;
      to = clamped.to;
    }
    handleFilterChange(FILTER_PARAM_FROM, from);
    handleFilterChange(FILTER_PARAM_TO, to);
    handleFilterChange(FILTER_PARAM_AGE, currentValue.age);
  }, [handleFilterChange, currentValue]);
  

  return (
    <TableColumnFilter
      title="Set last duration"
      isFilled={ Boolean(currentValue.from || currentValue.to || currentValue.age) }
      isTouched={ currentValue.age ? value.age !== currentValue.age : !isEqual(currentValue, value) }
      onFilter={ onFilter }
      onReset={ onReset }
      hasReset
    >
      <Flex gap={ 3 }>
        <PopoverCloseTriggerWrapper>
          <TagGroupSelect<AdvancedFilterAge>
            items={ ADVANCED_FILTER_AGES.map(val => ({ id: val, title: val })) }
            onChange={ onPresetChange }
            value={ currentValue.age || undefined }
          />
        </PopoverCloseTriggerWrapper>
      </Flex>
      <Flex mt={ 3 }>
        <Input
          value={currentValue.age ? '' : dayjs(currentValue.from).format('YYYY-MM-DD')}
          onChange={handleFromChange}
          placeholder="From"
          type="date"
          size="xs"
          max={currentValue.to ? dayjs(currentValue.to).subtract(MAX_DAYS, 'day').format('YYYY-MM-DD') : undefined}
        />
        <Text mx={3}>{ndash}</Text>
        <Input
          value={currentValue.age ? '' : dayjs(currentValue.to).format('YYYY-MM-DD')}
          onChange={handleToChange}
          placeholder="To"
          type="date"
          size="xs"
          min={currentValue.from ? dayjs(currentValue.from).format('YYYY-MM-DD') : undefined}
          max={currentValue.from ? dayjs(currentValue.from).add(MAX_DAYS, 'day').format('YYYY-MM-DD') : undefined}
        />
      </Flex>
    </TableColumnFilter>
  );
};

export default AgeFilter;
