/**
 * Main data table component for displaying trip pricing data
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import type { CsvData } from '../../types/csvData';

interface DataTableProps {
  data: CsvData | null;
  loading: boolean;
  error: string | null;
}

export const DataTable: React.FC<DataTableProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <Skeleton width={200} />
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Data Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select all filter options to view pricing data.
        </Typography>
      </Box>
    );
  }

  if (data.terms.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Future Trips Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All trips for this selection have already started or ended.
        </Typography>
      </Box>
    );
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      // Parse timestamp format: "dd.mm.yyyy hh:mm:ss"
      const [date, time] = timestamp.split(' ');
      const [day, month, year] = date.split('.');
      const [hour, minute] = time.split(':');

      // Return in European format: DD.MM.YYYY, HH:MM
      const formattedDate = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
      const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

      return `${formattedDate}, ${formattedTime}`;
    } catch {
      return timestamp;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">
          Trip Pricing Data
        </Typography>
        <Chip
          label={`${data.terms.length} upcoming trips`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Action links */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography
          component="a"
          href={`https://github.com/filipbiernat/RScraper/blob/master/data/${data.fileName}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          📊 View CSV Data on GitHub
        </Typography>

        {data.offerUrl && (
          <Typography
            component="a"
            href={data.offerUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{
              color: 'secondary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            🌍 View Trip Offer
          </Typography>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last updated: {data.lastUpdated ? formatTimestamp(data.lastUpdated) : 'Unknown'}
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                Trip Dates
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>
                Current Price
              </TableCell>
              {data.timestamps.map((timestamp, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: 100,
                    textAlign: 'center'
                  }}
                >
                  {formatTimestamp(timestamp)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.terms.map((term, index) => (
              <TableRow
                key={index}
                hover
                sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
              >
                <TableCell sx={{ fontWeight: 'medium' }}>
                  {term.dateRange}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatPrice(term.currentPrice)} zł
                  </Typography>
                </TableCell>
                {data.timestamps.map((timestamp, timestampIndex) => {
                  const priceEntry = term.priceHistory.find(p => p.timestamp === timestamp);
                  return (
                    <TableCell key={timestampIndex} sx={{ textAlign: 'center' }}>
                      {priceEntry ? (
                        <Typography variant="body2">
                          {formatPrice(priceEntry.price)} zł
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};